import {
  CROWD_SCORES,
  FEASIBILITY_THRESHOLDS,
  SCORING_WEIGHTS,
} from '../constants/scoring';
import type {
  CostBreakdown,
  CrowdLevel,
  FeasibilityStatus,
  RecommendationItem,
  ScoreBreakdown,
  TransportOptionData,
} from '../schemas';

/**
 * Computes round-trip available hours at the destination.
 * Proposal rule: 12 usable hours per day minus round-trip transit time.
 */
export function calculateAvailableTime(
  days: number,
  oneWayTravelHours: number,
  minHoursNeeded: number,
): { usable_hours: number; round_trip_hours: number; is_feasible: boolean; time_score: number } {
  const roundTripHours = Number((oneWayTravelHours * 2).toFixed(2));
  const totalDaylightHours = days * FEASIBILITY_THRESHOLDS.USABLE_HOURS_PER_DAY;
  const usableHours = Math.max(0, Number((totalDaylightHours - roundTripHours).toFixed(2)));
  const isFeasible = usableHours >= minHoursNeeded;

  let timeScore = 0;
  if (isFeasible) {
    const ratio = usableHours / Math.max(1, minHoursNeeded);
    timeScore = Math.min(100, Math.round(65 + Math.min(1, ratio - 1) * 35));
  }

  return {
    usable_hours: usableHours,
    round_trip_hours: roundTripHours,
    is_feasible: isFeasible,
    time_score: timeScore,
  };
}

/**
 * Selects the cheapest viable transport option from a given starting city.
 */
export function selectOptimalTransport(
  options: TransportOptionData[],
  startingCity: string,
): TransportOptionData | null {
  const normalized = startingCity.trim().toLowerCase();
  const cityOptions = options.filter(
    (opt) => opt.city_name.trim().toLowerCase() === normalized,
  );
  const pool = cityOptions.length > 0 ? cityOptions : options;
  if (pool.length === 0) return null;

  return [...pool].sort((a, b) => a.fare_per_person - b.fare_per_person)[0];
}

/**
 * Computes itemized BDT trip cost and determines feasibility category against budget.
 */
export function calculateBudgetFeasibility(params: {
  budget: number;
  travelers: number;
  days: number;
  oneWayFarePerPerson: number;
  hotelCostPerRoomNight: number;
  foodCostPerPersonDay: number;
  localFeesPerPerson: number;
}): {
  cost_breakdown: CostBreakdown;
  feasibility_status: FeasibilityStatus;
  budget_score: number;
} {
  const {
    budget,
    travelers,
    days,
    oneWayFarePerPerson,
    hotelCostPerRoomNight,
    foodCostPerPersonDay,
    localFeesPerPerson,
  } = params;

  const roundTripTransport = Math.round(oneWayFarePerPerson * 2 * travelers);
  const roomsNeeded = Math.ceil(travelers / 2);
  const nights = Math.max(0, days - 1);
  const hotelStay = Math.round(roomsNeeded * nights * hotelCostPerRoomNight);
  const foodTotal = Math.round(travelers * days * foodCostPerPersonDay);
  const localFees = Math.round(travelers * localFeesPerPerson);

  const subtotal = roundTripTransport + hotelStay + foodTotal + localFees;
  const safetyBuffer = Math.round(subtotal * FEASIBILITY_THRESHOLDS.SAFETY_BUFFER_RATIO);
  const totalCost = subtotal + safetyBuffer;

  let feasibilityStatus: FeasibilityStatus = 'Discard';
  let budgetScore = 0;

  if (totalCost <= budget) {
    feasibilityStatus = 'Fits';
    budgetScore = 100;
  } else if (totalCost <= budget * FEASIBILITY_THRESHOLDS.TIGHT_LIMIT_MULTIPLIER) {
    feasibilityStatus = 'Tight';
    const ratioOver = (totalCost - budget) / Math.max(1, budget * 0.10);
    budgetScore = Math.max(70, Math.round(99 - ratioOver * 29));
  } else if (totalCost <= budget * FEASIBILITY_THRESHOLDS.OVER_LIMIT_MULTIPLIER) {
    feasibilityStatus = 'Over budget';
    const ratioOver = (totalCost - budget * 1.10) / Math.max(1, budget * 0.15);
    budgetScore = Math.max(10, Math.round(69 - ratioOver * 59));
  } else {
    feasibilityStatus = 'Discard';
    budgetScore = 0;
  }

  return {
    cost_breakdown: {
      round_trip_transport: roundTripTransport,
      hotel_stay: hotelStay,
      rooms_needed: roomsNeeded,
      nights,
      food_total: foodTotal,
      local_fees: localFees,
      safety_buffer: safetyBuffer,
      subtotal,
      total_cost: totalCost,
    },
    feasibility_status: feasibilityStatus,
    budget_score: budgetScore,
  };
}

/**
 * Evaluates crowd tier with weekend/holiday step-up rule.
 */
export function calculateCrowdEvaluation(
  baseCrowd: CrowdLevel,
  hasHoliday: boolean,
): { effective_crowd: CrowdLevel; crowd_score: number } {
  let effective: CrowdLevel = baseCrowd;
  if (hasHoliday) {
    if (baseCrowd === 'Low') effective = 'Medium';
    else if (baseCrowd === 'Medium') effective = 'High';
  }
  return {
    effective_crowd: effective,
    crowd_score: CROWD_SCORES[effective],
  };
}

/**
 * Normalizes stored weather rating (1-5) into 0-100 score.
 */
export function calculateWeatherScore(rating: number): number {
  const clamped = Math.max(1, Math.min(5, rating));
  return Math.round((clamped / 5) * 100);
}

/**
 * Computes percentage overlap between extracted user tags and destination tags.
 */
export function calculateInterestScore(userTags: string[], destTags: string[]): number {
  if (!userTags || userTags.length === 0) return 75;
  const destSet = new Set(destTags.map((t) => t.toLowerCase().trim()));
  let matches = 0;
  for (const tag of userTags) {
    const clean = tag.toLowerCase().trim();
    if (destSet.has(clean)) {
      matches++;
    } else {
      for (const d of destSet) {
        if (d.includes(clean) || clean.includes(d)) {
          matches += 0.7;
          break;
        }
      }
    }
  }
  const ratio = Math.min(1, matches / Math.max(1, Math.min(userTags.length, 4)));
  return Math.round(ratio * 100);
}

/**
 * Computes weighted final recommendation score (0-100) using exact proposal weights.
 */
export function calculateMultiFactorScore(factors: {
  meaning_match: number;
  interest_match: number;
  budget_fit: number;
  time_fit: number;
  weather_fit: number;
  crowd_fit: number;
}): ScoreBreakdown {
  const finalScore =
    factors.meaning_match * SCORING_WEIGHTS.MEANING_MATCH +
    factors.interest_match * SCORING_WEIGHTS.INTEREST_MATCH +
    factors.budget_fit * SCORING_WEIGHTS.BUDGET_FIT +
    factors.time_fit * SCORING_WEIGHTS.TIME_FIT +
    factors.weather_fit * SCORING_WEIGHTS.WEATHER_FIT +
    factors.crowd_fit * SCORING_WEIGHTS.CROWD_FIT;

  return {
    meaning_match: Math.round(factors.meaning_match),
    interest_match: Math.round(factors.interest_match),
    budget_fit: Math.round(factors.budget_fit),
    time_fit: Math.round(factors.time_fit),
    weather_fit: Math.round(factors.weather_fit),
    crowd_fit: Math.round(factors.crowd_fit),
    final_score: Number(finalScore.toFixed(1)),
  };
}

/**
 * Client-side instant (<1s) budget slider recalculator (FR-13) without calling AI.
 */
export function recalculateForBudgetSlider(
  item: RecommendationItem,
  newBudget: number,
): RecommendationItem {
  const totalCost = item.cost_breakdown.total_cost;
  let feasibilityStatus: FeasibilityStatus = 'Discard';
  let budgetScore = 0;

  if (totalCost <= newBudget) {
    feasibilityStatus = 'Fits';
    budgetScore = 100;
  } else if (totalCost <= newBudget * FEASIBILITY_THRESHOLDS.TIGHT_LIMIT_MULTIPLIER) {
    feasibilityStatus = 'Tight';
    const ratioOver = (totalCost - newBudget) / Math.max(1, newBudget * 0.10);
    budgetScore = Math.max(70, Math.round(99 - ratioOver * 29));
  } else if (totalCost <= newBudget * FEASIBILITY_THRESHOLDS.OVER_LIMIT_MULTIPLIER) {
    feasibilityStatus = 'Over budget';
    const ratioOver = (totalCost - newBudget * 1.10) / Math.max(1, newBudget * 0.15);
    budgetScore = Math.max(10, Math.round(69 - ratioOver * 59));
  }

  const updatedScores = calculateMultiFactorScore({
    ...item.scores,
    budget_fit: budgetScore,
  });

  return {
    ...item,
    feasibility_status: feasibilityStatus,
    scores: updatedScores,
  };
}

/**
 * Pure cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}
