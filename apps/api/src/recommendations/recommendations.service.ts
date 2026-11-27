import { Injectable } from '@nestjs/common';
import {
  calculateAvailableTime,
  calculateBudgetFeasibility,
  calculateCrowdEvaluation,
  calculateInterestScore,
  calculateMultiFactorScore,
  calculateWeatherScore,
  cosineSimilarity,
  RecommendationItem,
  selectOptimalTransport,
  TripQueryInput,
} from '@vromon/shared';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async recommend(input: TripQueryInput) {
    const startTime = Date.now();

    // Fetch all destinations with related attributes and pre-computed embeddings
    const destinations = await this.prisma.destination.findMany({
      include: {
        division: true,
        tags: { include: { tag: true } },
        attractions: true,
        transport_options: { include: { city: true } },
        monthly_conditions: true,
      },
    });

    const destinationNames = destinations.map((d) => d.name);

    // Parallel AI-1 (Intent extraction) & AI-2 (Query embedding)
    const [intent, queryEmbedding] = await Promise.all([
      this.aiService.extractTravelIntent(input.wishes, destinationNames),
      this.aiService.generateQueryEmbedding(input.wishes),
    ]);

    // Apply inferred parameters whenever the user explicitly stated numbers in their prompt text
    const effectiveBudget =
      intent.inferred_budget && intent.inferred_budget > 0
        ? intent.inferred_budget
        : input.budget;
    const effectiveTravelers =
      intent.inferred_travelers && intent.inferred_travelers > 0
        ? intent.inferred_travelers
        : input.travelers;
    const effectiveDays =
      intent.inferred_days && intent.inferred_days > 0
        ? intent.inferred_days
        : input.days;

    // Evaluate all candidates using pure math calculators
    const evaluated: Array<{
      item: Omit<RecommendationItem, 'ai_reason' | 'alternative_suggestion'>;
      rawDest: any;
      isExplicitTarget: boolean;
    }> = [];

    for (const dest of destinations) {
      const transportList = dest.transport_options.map((t) => ({
        mode: t.mode as any,
        fare_per_person: Number(t.fare_per_person),
        travel_hours: Number(t.travel_hours),
        city_name: t.city.name,
      }));

      // Fallback synthetic route if exact starting city is missing
      const selectedTransport = selectOptimalTransport(transportList, input.starting_city) || {
        mode: 'Bus' as const,
        fare_per_person: 650,
        travel_hours: 6,
        city_name: input.starting_city,
      };

      const timeEval = calculateAvailableTime(
        effectiveDays,
        selectedTransport.travel_hours,
        dest.min_hours_needed,
      );

      const isExplicitTarget =
        !!intent.target_destination_hint &&
        dest.name.toLowerCase() === intent.target_destination_hint.toLowerCase();

      // FR-6: Eliminate places that need more time than user has (unless explicitly requested by name)
      if (!timeEval.is_feasible && !isExplicitTarget) {
        continue;
      }

      const budgetEval = calculateBudgetFeasibility({
        budget: effectiveBudget,
        travelers: effectiveTravelers,
        days: effectiveDays,
        oneWayFarePerPerson: selectedTransport.fare_per_person,
        hotelCostPerRoomNight: Number(dest.hotel_cost_per_room_night),
        foodCostPerPersonDay: Number(dest.food_cost_per_person_day),
        localFeesPerPerson: Number(dest.local_fees_per_person),
      });

      // FR-4: Discard >25% over budget (unless explicitly targeted by user so we can tell them!)
      if (budgetEval.feasibility_status === 'Discard' && !isExplicitTarget) {
        continue;
      }

      const monthCond = dest.monthly_conditions.find((m) => m.month_no === input.travel_month);
      const weatherRating = monthCond?.weather_rating ?? 4;
      const weatherNote = monthCond?.weather_note ?? null;
      const baseCrowd = (monthCond?.crowd_level ?? 'Medium') as 'Low' | 'Medium' | 'High';

      const weatherScore = calculateWeatherScore(weatherRating);
      const crowdEval = calculateCrowdEvaluation(baseCrowd, input.has_holiday);

      const destTags = dest.tags.map((dt) => dt.tag.tag_name);
      const interestScore = calculateInterestScore(intent.detected_tags, destTags);

      // Meaning match: Vector cosine similarity or lexical fallback
      let meaningScore = 50;
      if (queryEmbedding.length > 0 && dest.embedding.length === queryEmbedding.length) {
        const sim = cosineSimilarity(queryEmbedding, dest.embedding);
        // Gemini embeddings typically fall in [0.35, 0.85] for matching queries
        meaningScore = Math.max(0, Math.min(100, Math.round(((sim - 0.3) / 0.55) * 100)));
      } else {
        // Clean lexical overlap fallback if offline
        const lowerWish = input.wishes.toLowerCase();
        const combined = `${dest.name} ${dest.district} ${dest.description} ${destTags.join(' ')}`.toLowerCase();
        const words = lowerWish.split(/\s+/).filter((w) => w.length > 3);
        const hits = words.filter((w) => combined.includes(w)).length;
        meaningScore = Math.min(95, 45 + hits * 12);
      }

      if (isExplicitTarget) {
        meaningScore = 100;
      }

      const scores = calculateMultiFactorScore({
        meaning_match: meaningScore,
        interest_match: isExplicitTarget ? 100 : interestScore,
        budget_fit: budgetEval.budget_score,
        time_fit: isExplicitTarget && !timeEval.is_feasible ? 40 : timeEval.time_score,
        weather_fit: weatherScore,
        crowd_fit: crowdEval.crowd_score,
      });

      evaluated.push({
        isExplicitTarget,
        rawDest: dest,
        item: {
          destination_id: dest.destination_id,
          name: dest.name,
          name_bn: dest.name_bn,
          division: dest.division.name,
          district: dest.district,
          description: dest.description,
          latitude: Number(dest.latitude),
          longitude: Number(dest.longitude),
          cost_level: dest.cost_level as any,
          image_url: dest.image_url,
          tags: destTags,
          attractions: dest.attractions.map((a) => ({
            attraction_id: a.attraction_id,
            name: a.name,
            description: a.description,
            est_hours: Number(a.est_hours),
          })),
          selected_transport: selectedTransport,
          usable_hours: timeEval.usable_hours,
          min_hours_needed: dest.min_hours_needed,
          cost_breakdown: budgetEval.cost_breakdown,
          feasibility_status: budgetEval.feasibility_status,
          weather_rating: weatherRating,
          weather_note: weatherNote,
          base_crowd: baseCrowd,
          effective_crowd: crowdEval.effective_crowd,
          scores,
        },
      });
    }

    // Sort: explicit target first, then descending by final_score
    evaluated.sort((a, b) => {
      if (a.isExplicitTarget !== b.isExplicitTarget) return a.isExplicitTarget ? -1 : 1;
      return b.item.scores.final_score - a.item.scores.final_score;
    });

    const topCandidates = evaluated.slice(0, 8);

    // Find best feasible alternative if top results have constraints (FR-11)
    const cleanFitsAlternative = evaluated.find(
      (e) =>
        !e.isExplicitTarget &&
        e.item.feasibility_status === 'Fits' &&
        e.item.effective_crowd !== 'High',
    );

    // Generate AI-3 Grounded Reasons via single batch Gemini call for Top 4 matches (or single call for 1 match)
    const candidateParams = topCandidates.map(({ item, rawDest }) => ({
      destination_id: item.destination_id,
      userWishes: input.wishes,
      intent,
      destinationName: item.name,
      district: item.district,
      division: item.division,
      description: item.description,
      hotelRatePerNight: Number(rawDest.hotel_cost_per_room_night),
      transportMode: item.selected_transport.mode,
      oneWayFare: item.selected_transport.fare_per_person,
      usableHours: item.usable_hours,
      budget: effectiveBudget,
      travelers: effectiveTravelers,
      days: effectiveDays,
      costBreakdown: item.cost_breakdown,
      feasibilityStatus: item.feasibility_status,
      weatherRating: item.weather_rating,
      weatherNote: item.weather_note,
      effectiveCrowd: item.effective_crowd,
      attractions: item.attractions,
    }));

    let batchReasonsMap = new Map<number, string>();
    if (
      topCandidates.length > 1 &&
      typeof (this.aiService as any).generateGroundedReasonsBatch === 'function'
    ) {
      batchReasonsMap = await this.aiService.generateGroundedReasonsBatch(
        input.wishes,
        intent,
        candidateParams.slice(0, 4),
      );
    }

    const results: RecommendationItem[] = await Promise.all(
      topCandidates.map(async (entry, idx) => {
        const { item } = entry;
        const params = candidateParams[idx];

        const aiReason =
          batchReasonsMap.get(item.destination_id) ||
          (idx === 0
            ? await this.aiService.generateGroundedReason(params)
            : this.aiService.buildFallbackReason(params));

        const hasConstraint =
          item.feasibility_status !== 'Fits' || item.effective_crowd === 'High';

        const alternative_suggestion =
          hasConstraint &&
          cleanFitsAlternative &&
          cleanFitsAlternative.item.destination_id !== item.destination_id
            ? {
                destination_id: cleanFitsAlternative.item.destination_id,
                name: cleanFitsAlternative.item.name,
                name_bn: cleanFitsAlternative.item.name_bn,
                reason: `Lower crowd (${cleanFitsAlternative.item.effective_crowd}) and comfortably fits your budget at ৳${cleanFitsAlternative.item.cost_breakdown.total_cost.toLocaleString()}.`,
                total_cost: cleanFitsAlternative.item.cost_breakdown.total_cost,
                feasibility_status: cleanFitsAlternative.item.feasibility_status,
              }
            : null;

        return {
          ...item,
          ai_reason: aiReason,
          alternative_suggestion,
        };
      }),
    );

    const latencyMs = Date.now() - startTime;

    // Non-blocking query log for Admin metrics
    this.prisma.query_log
      .create({
        data: {
          wishes: input.wishes,
          budget: effectiveBudget,
          travelers: effectiveTravelers,
          days: effectiveDays,
          starting_city: input.starting_city,
          results_count: results.length,
          top_match: results[0]?.name || null,
          latency_ms: latencyMs,
        },
      })
      .catch(() => {});

    return {
      query: {
        ...input,
        budget: effectiveBudget,
        travelers: effectiveTravelers,
        days: effectiveDays,
      },
      intent,
      total_evaluated: evaluated.length,
      recommendations: results,
      latency_ms: latencyMs,
    };
  }
}
