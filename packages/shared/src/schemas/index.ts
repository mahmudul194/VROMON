import { z } from 'zod';

export const CostLevelSchema = z.enum(['Low', 'Medium', 'High']);
export type CostLevel = z.infer<typeof CostLevelSchema>;

export const CrowdLevelSchema = z.enum(['Low', 'Medium', 'High']);
export type CrowdLevel = z.infer<typeof CrowdLevelSchema>;

export const TransportModeSchema = z.enum(['Bus', 'Train', 'Launch']);
export type TransportMode = z.infer<typeof TransportModeSchema>;

export const FeasibilityStatusSchema = z.enum([
  'Fits',
  'Tight',
  'Over budget',
  'Discard',
]);
export type FeasibilityStatus = z.infer<typeof FeasibilityStatusSchema>;

export const TripQueryInputSchema = z.object({
  wishes: z.string().min(2, 'Please describe what kind of trip you want'),
  budget: z.number().min(500).max(500000),
  travelers: z.number().int().min(1).max(30),
  days: z.number().int().min(1).max(15),
  travel_month: z.number().int().min(1).max(12),
  starting_city: z.string().min(2),
  has_holiday: z.boolean().default(false),
});
export type TripQueryInput = z.infer<typeof TripQueryInputSchema>;

export const ParsedTravelIntentSchema = z.object({
  target_destination_hint: z.string().optional().nullable(),
  inferred_budget: z.number().optional().nullable(),
  inferred_travelers: z.number().optional().nullable(),
  inferred_days: z.number().optional().nullable(),
  detected_tags: z.array(z.string()).default([]),
  detected_mood: z.string().default('relaxed'),
  seasonal_hints: z.array(z.string()).default([]),
  user_questions: z
    .object({
      asks_places: z.boolean().default(false),
      asks_food: z.boolean().default(false),
      asks_budget_sufficiency: z.boolean().default(false),
      asks_hotel_rates: z.boolean().default(false),
    })
    .default({}),
});
export type ParsedTravelIntent = z.infer<typeof ParsedTravelIntentSchema>;

export interface CostBreakdown {
  round_trip_transport: number;
  hotel_stay: number;
  rooms_needed: number;
  nights: number;
  food_total: number;
  local_fees: number;
  safety_buffer: number;
  subtotal: number;
  total_cost: number;
}

export interface ScoreBreakdown {
  meaning_match: number;
  interest_match: number;
  budget_fit: number;
  time_fit: number;
  weather_fit: number;
  crowd_fit: number;
  final_score: number;
}

export interface TransportOptionData {
  mode: TransportMode;
  fare_per_person: number;
  travel_hours: number;
  city_name: string;
}

export interface RecommendationItem {
  destination_id: number;
  name: string;
  name_bn?: string | null;
  division: string;
  district: string;
  description: string;
  latitude: number;
  longitude: number;
  cost_level: CostLevel;
  image_url?: string | null;
  tags: string[];
  attractions: Array<{
    attraction_id: number;
    name: string;
    description: string | null;
    est_hours: number;
  }>;
  selected_transport: TransportOptionData;
  usable_hours: number;
  min_hours_needed: number;
  cost_breakdown: CostBreakdown;
  feasibility_status: FeasibilityStatus;
  weather_rating: number;
  weather_note: string | null;
  base_crowd: CrowdLevel;
  effective_crowd: CrowdLevel;
  scores: ScoreBreakdown;
  ai_reason: string;
  alternative_suggestion?: {
    destination_id: number;
    name: string;
    name_bn?: string | null;
    reason: string;
    total_cost: number;
    feasibility_status: FeasibilityStatus;
  } | null;
}
