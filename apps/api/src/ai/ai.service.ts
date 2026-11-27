import { GoogleGenAI } from '@google/genai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CostBreakdown,
  CrowdLevel,
  FeasibilityStatus,
  ParsedTravelIntent,
  ParsedTravelIntentSchema,
} from '@vromon/shared';
import { z } from 'zod';

const BatchReasonsSchema = z.object({
  reasons: z.array(
    z.object({
      destination_id: z.number().int(),
      reason: z.string(),
    }),
  ),
});

const ItineraryOutputSchema = z.object({
  days: z.array(
    z.object({
      day_number: z.number().int(),
      title: z.string(),
      slots: z.array(
        z.object({
          time_of_day: z.enum(['Morning', 'Afternoon', 'Evening']),
          activity_name: z.string(),
          description: z.string(),
          hours: z.number(),
        }),
      ),
    }),
  ),
});

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly llmModels: string[];
  private readonly embeddingModel: string;
  private genAiClient: GoogleGenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_API_KEY', '');
    const primaryModel = this.configService.get<string>('LLM_MODEL', 'gemini-3-flash-preview');
    this.llmModels = [primaryModel];
    this.embeddingModel = this.configService.get<string>('EMBEDDING_MODEL', 'gemini-embedding-001');

    if (this.apiKey) {
      this.genAiClient = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  private getChatModel(modelName: string, temperature = 0.1): ChatGoogleGenerativeAI {
    return new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model: modelName,
      temperature,
    });
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private async generateFastJson<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    timeoutMs = 10000,
    temperature = 0.15,
  ): Promise<z.infer<S> | null> {
    if (!this.genAiClient) return null;
    for (const modelName of this.llmModels) {
      try {
        const resp = await this.withTimeout(
          this.genAiClient.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          timeoutMs,
          `generateFastJson(${modelName})`,
        );
        const rawText = (resp.text || '').trim();
        if (!rawText) continue;
        const parsed = JSON.parse(rawText);
        return schema.parse(parsed);
      } catch (err) {
        this.logger.warn(`Fast JSON generation (${modelName}) failed: ${err}`);
      }
    }
    return null;
  }

  private async generateFastText(
    prompt: string,
    timeoutMs = 9000,
    temperature = 0.2,
  ): Promise<string | null> {
    if (!this.genAiClient) return null;
    for (const modelName of this.llmModels) {
      try {
        const resp = await this.withTimeout(
          this.genAiClient.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          timeoutMs,
          `generateFastText(${modelName})`,
        );
        const text = (resp.text || '').trim();
        if (text.length > 20) return text;
      } catch (err) {
        this.logger.warn(`Fast text generation (${modelName}) failed: ${err}`);
      }
    }
    return null;
  }

  /**
   * AI-1: Extract structured intent, destination hints, and compound user questions.
   */
  async extractTravelIntent(
    wishes: string,
    knownDestinationNames: string[],
  ): Promise<ParsedTravelIntent> {
    if (this.apiKey) {
      const prompt = `You are a travel query analyzer for Bangladesh tourism (VROMON).
Extract structured parameters from the user's natural language request (which may be in English, Bengali, or Banglish).

Return ONLY valid JSON with these exact keys:
{
  "target_destination_hint": string | null,
  "inferred_budget": number | null,
  "inferred_travelers": number | null,
  "inferred_days": number | null,
  "detected_tags": string[],
  "detected_mood": string,
  "seasonal_hints": string[],
  "user_questions": {
    "asks_places": boolean,
    "asks_food": boolean,
    "asks_budget_sufficiency": boolean,
    "asks_hotel_rates": boolean
  }
}

Known Bangladesh destinations list (match exactly if the user explicitly mentions one):
${knownDestinationNames.join(', ')}

Examples:
1) Input: "quiet hill place with tea gardens, good in winter, under 15,000 taka for two people"
   -> {"target_destination_hint": null, "inferred_budget": 15000, "inferred_travelers": 2, "inferred_days": null, "detected_tags": ["hills", "tea-gardens", "quiet", "winter-optimal"], "detected_mood": "tranquil", "seasonal_hints": ["winter"], "user_questions": { "asks_places": false, "asks_food": false, "asks_budget_sufficiency": true, "asks_hotel_rates": false }}

2) Input: "hey i want to go to khulna what are the places to see around, what kind of food i can explore there, i have 10k budget will it be suffecient and we are 2 people where can we stay what are the hotel price rates"
   -> {"target_destination_hint": "Khulna", "inferred_budget": 10000, "inferred_travelers": 2, "inferred_days": null, "detected_tags": ["food", "city", "heritage", "river"], "detected_mood": "cultural-food", "seasonal_hints": [], "user_questions": { "asks_places": true, "asks_food": true, "asks_budget_sufficiency": true, "asks_hotel_rates": true }}

User Query: "${wishes}"`;

      const fastIntent = await this.generateFastJson(prompt, ParsedTravelIntentSchema, 8000, 0.1);
      if (fastIntent) return fastIntent;

      for (const modelName of this.llmModels) {
        try {
          const structuredLlm = this.getChatModel(modelName, 0.1).withStructuredOutput(
            ParsedTravelIntentSchema,
          );
          const result = await this.withTimeout(
            structuredLlm.invoke(prompt),
            8500,
            `extractTravelIntent(${modelName})`,
          );
          return ParsedTravelIntentSchema.parse(result);
        } catch (err) {
          this.logger.warn(`LangChain intent extraction (${modelName}) failed/timed out: ${err}`);
        }
      }
    }

    return this.fallbackIntentExtraction(wishes, knownDestinationNames);
  }

  private fallbackIntentExtraction(
    wishes: string,
    knownDestinationNames: string[],
  ): ParsedTravelIntent {
    const lower = wishes.toLowerCase();

    // Match explicit destination mention
    let targetHint: string | null = null;
    for (const name of knownDestinationNames) {
      if (lower.includes(name.toLowerCase())) {
        targetHint = name;
        break;
      }
    }

    // Match budget like 10k, 15000, 15,000
    let inferredBudget: number | null = null;
    const kMatch = lower.match(/(\d+)\s*k\b/);
    const numMatch = lower.match(/(\d{4,6})\s*(?:taka|bdt|tk)?/);
    if (kMatch) inferredBudget = parseInt(kMatch[1], 10) * 1000;
    else if (numMatch) inferredBudget = parseInt(numMatch[1], 10);

    // Match travelers
    let inferredTravelers: number | null = null;
    const travMatch = lower.match(/(\d+)\s*(?:people|person|persons|traveler|travelers|friends)/);
    if (travMatch) inferredTravelers = parseInt(travMatch[1], 10);
    else if (lower.includes('two people') || lower.includes('couple')) inferredTravelers = 2;

    // Match tags
    const tagMap: Record<string, string[]> = {
      'tea-gardens': ['tea', 'চা'],
      hills: ['hill', 'mountain', 'cloud', 'পাহাড়', 'পাহাড়'],
      quiet: ['quiet', 'calm', 'peaceful', 'tranquil', 'শান্ত'],
      'sea-beach': ['beach', 'sea', 'ocean', 'island', 'সমুদ্র'],
      food: ['food', 'eat', 'cuisine', 'biryani', 'chui', 'খাবার'],
      heritage: ['heritage', 'history', 'fort', 'palace', 'mosque', 'temple', 'ঐতিহ্য'],
      river: ['river', 'boat', 'haor', 'wetland', 'নদী', 'হাওর'],
      forest: ['forest', 'wildlife', 'mangrove', 'sundarban', 'বন'],
      'winter-optimal': ['winter', 'december', 'january', 'শীত'],
    };

    const detectedTags: string[] = [];
    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        detectedTags.push(tag);
      }
    }

    return {
      target_destination_hint: targetHint,
      inferred_budget: inferredBudget,
      inferred_travelers: inferredTravelers,
      inferred_days: null,
      detected_tags: detectedTags.length > 0 ? detectedTags : ['nature', 'sightseeing'],
      detected_mood: lower.includes('quiet') || lower.includes('calm') ? 'tranquil' : 'explorer',
      seasonal_hints: lower.includes('winter') ? ['winter'] : [],
      user_questions: {
        asks_places: lower.includes('place') || lower.includes('see') || lower.includes('visit'),
        asks_food: lower.includes('food') || lower.includes('eat') || lower.includes('explore'),
        asks_budget_sufficiency:
          lower.includes('budget') || lower.includes('suffecient') || lower.includes('sufficient'),
        asks_hotel_rates:
          lower.includes('hotel') || lower.includes('stay') || lower.includes('rate'),
      },
    };
  }

  /**
   * AI-2: Generate dense vector embedding for semantic matching.
   */
  async generateQueryEmbedding(text: string): Promise<number[]> {
    if (!this.genAiClient) return [];
    const candidates = [this.embeddingModel, 'gemini-embedding-001'];
    for (const model of candidates) {
      try {
        const resp = await this.withTimeout(
          this.genAiClient.models.embedContent({ model, contents: text }),
          3500,
          'embedContent',
        );
        const vals = resp.embeddings?.[0]?.values;
        if (vals && vals.length > 0) return vals.slice(0, 768);
      } catch {
        // try fallback
      }
    }
    return [];
  }

  /**
   * AI-3 & AI-5: Single-call batch grounded explanations for top results (fast & rate-limit safe).
   */
  async generateGroundedReasonsBatch(
    userWishes: string,
    intent: ParsedTravelIntent,
    items: Array<{
      destination_id: number;
      destinationName: string;
      district: string;
      division: string;
      description: string;
      hotelRatePerNight: number;
      transportMode: string;
      oneWayFare: number;
      usableHours: number;
      budget: number;
      travelers: number;
      days: number;
      costBreakdown: CostBreakdown;
      feasibilityStatus: FeasibilityStatus;
      weatherRating: number;
      weatherNote: string | null;
      effectiveCrowd: CrowdLevel;
      attractions: Array<{ name: string; description: string | null }>;
    }>,
  ): Promise<Map<number, string>> {
    const resultMap = new Map<number, string>();
    for (const p of items) {
      resultMap.set(p.destination_id, this.buildFallbackReason({ intent, ...p }));
    }

    if (!this.apiKey || items.length === 0) return resultMap;

    const contextBlocks = items
      .map(
        (p) => `### Destination ID ${p.destination_id}: ${p.destinationName} (${p.district}, ${p.division})
- Feasibility: ${p.feasibilityStatus} | Total Cost: ৳${p.costBreakdown.total_cost} vs User Budget: ৳${p.budget} (${p.days}d, ${p.travelers} travelers)
- Transport (${p.transportMode}): ৳${p.oneWayFare}/person one-way (Round-trip: ৳${p.costBreakdown.round_trip_transport})
- Hotel Rate: ৳${p.hotelRatePerNight}/room/night (Total stay: ৳${p.costBreakdown.hotel_stay}) | Food: ৳${p.costBreakdown.food_total}
- Usable Hours: ${p.usableHours}h | Weather: ${p.weatherRating}/5 (${p.weatherNote || 'Seasonal'}) | Crowd: ${p.effectiveCrowd}
- Summary: ${p.description}
- Attractions: ${p.attractions.map((a) => `${a.name}${a.description ? ` (${a.description})` : ''}`).join('; ')}`,
      )
      .join('\n\n');

    const prompt = `You are VROMON's grounded travel advisor. For each destination below, write a crisp 2-4 sentence factual explanation answering the user's query.
STRICT RULES: Use ONLY numbers and attractions provided below. Never invent prices, travel times, or spots. Never use internal enum words like "Discard" or "discarded" (instead state naturally that the estimated total exceeds the budget). No emojis.
Return ONLY valid JSON matching: { "reasons": [{ "destination_id": number, "reason": string }] }

USER QUERY: "${userWishes}"

${contextBlocks}`;

    const fastBatch = await this.generateFastJson(prompt, BatchReasonsSchema, 10000, 0.2);
    if (fastBatch) {
      for (const r of fastBatch.reasons || []) {
        if (r.reason && r.reason.trim().length > 15) {
          resultMap.set(r.destination_id, r.reason.trim());
        }
      }
      return resultMap;
    }

    for (const modelName of this.llmModels) {
      try {
        const structuredLlm = this.getChatModel(modelName, 0.2).withStructuredOutput(BatchReasonsSchema);
        const res = await this.withTimeout(
          structuredLlm.invoke(prompt),
          8000,
          `generateGroundedReasonsBatch(${modelName})`,
        );
        for (const r of res.reasons || []) {
          if (r.reason && r.reason.trim().length > 15) {
            resultMap.set(r.destination_id, r.reason.trim());
          }
        }
        return resultMap;
      } catch (err) {
        this.logger.warn(`Batch grounded reason (${modelName}) failed: ${err}`);
      }
    }
    return resultMap;
  }

  /**
   * AI-3 & AI-5: Grounded explanation using ONLY verified database facts and calculator output.
   */
  async generateGroundedReason(params: {
    userWishes: string;
    intent: ParsedTravelIntent;
    destinationName: string;
    district: string;
    division: string;
    description: string;
    hotelRatePerNight: number;
    transportMode: string;
    oneWayFare: number;
    usableHours: number;
    budget: number;
    travelers: number;
    days: number;
    costBreakdown: CostBreakdown;
    feasibilityStatus: FeasibilityStatus;
    weatherRating: number;
    weatherNote: string | null;
    effectiveCrowd: CrowdLevel;
    attractions: Array<{ name: string; description: string | null }>;
  }): Promise<string> {
    const fallback = this.buildFallbackReason(params);

    if (!this.apiKey) return fallback;

    const prompt = `You are VROMON's grounded travel advisor. Write a crisp, factual 2-4 sentence explanation for why ${params.destinationName} (${params.district}, ${params.division}) fits the user's query.

STRICT RULES (NO HALLUCINATIONS):
- Use ONLY the numbers and attractions listed below. Do NOT invent any prices, travel times, restaurants, or locations not present here.
- Directly answer any specific questions the user asked (places to see, food mentions from attractions/description, whether the budget is sufficient, hotel nightly rate).
- Never use internal enum words like "Discard" or "discarded" (instead state naturally that the estimated total exceeds the budget).
- Do NOT use emojis or markdown headings. Keep it conversational, helpful, and concise.

USER QUERY: "${params.userWishes}"

VERIFIED CALCULATED FACTS:
- Trip Parameters: ${params.days} days (${params.costBreakdown.nights} nights), ${params.travelers} traveler(s), User Budget: ৳${params.budget}
- Feasibility Status: ${params.feasibilityStatus}
- Total Estimated Cost (including 10% buffer): ৳${params.costBreakdown.total_cost}
- Cheapest Transport (${params.transportMode}): ৳${params.oneWayFare}/person one-way (Round-trip total: ৳${params.costBreakdown.round_trip_transport})
- Hotel Rate: ৳${params.hotelRatePerNight}/room/night (${params.costBreakdown.rooms_needed} room(s) = ৳${params.costBreakdown.hotel_stay})
- Food Budget: ৳${params.costBreakdown.food_total} total
- Usable Exploration Time: ${params.usableHours} hours
- Weather & Crowd: Rating ${params.weatherRating}/5 (${params.weatherNote || 'Seasonal estimate'}), Crowd: ${params.effectiveCrowd}
- Description: ${params.description}
- Stored Attractions: ${params.attractions.map((a) => `${a.name}${a.description ? ` (${a.description})` : ''}`).join('; ')}`;

    const fastReason = await this.generateFastText(prompt, 8500, 0.2);
    if (fastReason) return fastReason;

    for (const modelName of this.llmModels) {
      try {
        const response = await this.withTimeout(
          this.getChatModel(modelName, 0.2).invoke(prompt),
          6500,
          `generateGroundedReason(${modelName})`,
        );
        const content = typeof response.content === 'string' ? response.content.trim() : '';
        if (content.length > 20) return content;
      } catch (err) {
        this.logger.warn(`Grounded reason generation (${modelName}) failed: ${err}`);
      }
    }
    return fallback;
  }

  public buildFallbackReason(params: {
    intent: ParsedTravelIntent;
    destinationName: string;
    hotelRatePerNight: number;
    transportMode: string;
    oneWayFare: number;
    usableHours: number;
    budget: number;
    travelers: number;
    days: number;
    costBreakdown: CostBreakdown;
    feasibilityStatus: FeasibilityStatus;
    weatherRating: number;
    effectiveCrowd: CrowdLevel;
    attractions: Array<{ name: string; description: string | null }>;
  }): string {
    const {
      intent,
      destinationName,
      hotelRatePerNight,
      transportMode,
      usableHours,
      budget,
      travelers,
      days,
      costBreakdown,
      feasibilityStatus,
      attractions,
    } = params;

    const parts: string[] = [];

    if (feasibilityStatus === 'Fits') {
      parts.push(
        `Your ৳${budget.toLocaleString()} budget is sufficient for ${travelers} traveler(s) over ${days} day(s) in ${destinationName}, with an estimated total of ৳${costBreakdown.total_cost.toLocaleString()} using ${transportMode} transit.`,
      );
    } else if (feasibilityStatus === 'Tight') {
      parts.push(
        `A ${days}-day trip to ${destinationName} totals ৳${costBreakdown.total_cost.toLocaleString()}, which sits slightly tight against your ৳${budget.toLocaleString()} budget.`,
      );
    } else {
      parts.push(
        `Estimated cost is ৳${costBreakdown.total_cost.toLocaleString()} for ${days} day(s), exceeding your ৳${budget.toLocaleString()} budget envelope.`,
      );
    }

    if (intent.user_questions.asks_hotel_rates) {
      parts.push(
        `Standard double rooms average around ৳${hotelRatePerNight.toLocaleString()} per night (৳${costBreakdown.hotel_stay.toLocaleString()} for ${costBreakdown.nights} night(s)).`,
      );
    }

    if ((intent.user_questions.asks_places || intent.user_questions.asks_food) && attractions.length > 0) {
      const topSpots = attractions
        .slice(0, 3)
        .map((a) => (a.description ? `${a.name} (${a.description})` : a.name))
        .join(', ');
      parts.push(`Top verified experiences include ${topSpots} across ${usableHours} usable hours.`);
    } else {
      parts.push(
        `You get ${usableHours} usable hours on-site with a ${params.weatherRating}/5 weather score and ${params.effectiveCrowd} expected crowd.`,
      );
    }

    return parts.join(' ');
  }

  /**
   * AI-4: Generate grounded day-by-day itinerary using ONLY stored attractions and usable hours.
   */
  async generateItinerary(params: {
    destinationName: string;
    days: number;
    usableHours: number;
    attractions: Array<{ name: string; description: string | null; est_hours: number }>;
  }) {
    const fallback = this.buildFallbackItinerary(params);
    if (!this.apiKey || params.attractions.length === 0) return fallback;

    const prompt = `Create a ${params.days}-day trip plan for ${params.destinationName} within ${params.usableHours} total usable hours (max 12h/day).
Use ONLY the following stored attractions. Do NOT invent spots or fake prices. No emojis.
Return ONLY valid JSON matching:
{
  "days": [
    {
      "day_number": number,
      "title": string,
      "slots": [
        { "time_of_day": "Morning" | "Afternoon" | "Evening", "activity_name": string, "description": string, "hours": number }
      ]
    }
  ]
}

Attractions:
${params.attractions.map((a) => `- ${a.name} (${a.est_hours}h): ${a.description || ''}`).join('\n')}`;

    const fastPlan = await this.generateFastJson(prompt, ItineraryOutputSchema, 11000, 0.2);
    if (fastPlan) return fastPlan;

    for (const modelName of this.llmModels) {
      try {
        const structuredLlm = this.getChatModel(modelName, 0.2).withStructuredOutput(
          ItineraryOutputSchema,
        );
        const result = await this.withTimeout(
          structuredLlm.invoke(prompt),
          6500,
          `generateItinerary(${modelName})`,
        );
        return result;
      } catch (err) {
        this.logger.warn(`Itinerary generation (${modelName}) failed: ${err}`);
      }
    }
    return fallback;
  }

  private buildFallbackItinerary(params: {
    destinationName: string;
    days: number;
    attractions: Array<{ name: string; description: string | null; est_hours: number }>;
  }) {
    const resultDays = [];
    const pool = [...params.attractions];
    const timeLabels: Array<'Morning' | 'Afternoon' | 'Evening'> = ['Morning', 'Afternoon', 'Evening'];

    let idx = 0;
    for (let d = 1; d <= params.days; d++) {
      const slots: Array<{
        time_of_day: 'Morning' | 'Afternoon' | 'Evening';
        activity_name: string;
        description: string;
        hours: number;
      }> = [];

      for (let s = 0; s < 3 && idx < pool.length; s++) {
        const attr = pool[idx++];
        slots.push({
          time_of_day: timeLabels[s],
          activity_name: attr.name,
          description: attr.description || `Explore ${attr.name} in ${params.destinationName}`,
          hours: attr.est_hours || 2,
        });
      }

      if (slots.length === 0) {
        slots.push({
          time_of_day: 'Morning',
          activity_name: d === 1 ? `Arrival & Local Orientation in ${params.destinationName}` : 'Return Transit & Departure',
          description: 'Scenic local exploration and return journey logistics.',
          hours: 4,
        });
      }

      resultDays.push({
        day_number: d,
        title: d === 1 ? `Arrival & Key Highlights` : d === params.days ? `Final Exploration & Departure` : `Local Culture & Discovery`,
        slots,
      });
    }

    return { days: resultDays };
  }
}
