import {
  calculateAvailableTime,
  calculateBudgetFeasibility,
  calculateCrowdEvaluation,
  calculateInterestScore,
  calculateMultiFactorScore,
  calculateWeatherScore,
  cosineSimilarity,
  recalculateForBudgetSlider,
  selectOptimalTransport,
} from '../src';

describe('@vromon/shared pure calculators', () => {
  test('Available time deducts round-trip transit from 12h/day', () => {
    const res = calculateAvailableTime(3, 6, 18);
    // 3 * 12 - 12 = 24 usable hours >= 18
    expect(res.usable_hours).toBe(24);
    expect(res.round_trip_hours).toBe(12);
    expect(res.is_feasible).toBe(true);
    expect(res.time_score).toBeGreaterThan(65);
  });

  test('Available time rejects destination when usable < min_hours_needed', () => {
    const res = calculateAvailableTime(1, 5, 8);
    // 12 - 10 = 2 usable hours < 8
    expect(res.usable_hours).toBe(2);
    expect(res.is_feasible).toBe(false);
    expect(res.time_score).toBe(0);
  });

  test('Khulna 10k 2-person 2-day train feasibility benchmark', () => {
    const res = calculateBudgetFeasibility({
      budget: 10000,
      travelers: 2,
      days: 2,
      oneWayFarePerPerson: 500, // Dhaka -> Khulna train
      hotelCostPerRoomNight: 2500,
      foodCostPerPersonDay: 600,
      localFeesPerPerson: 300,
    });
    // Transport: 500 * 2 * 2 = 2000
    // Hotel: 1 room * 1 night * 2500 = 2500
    // Food: 2 * 2 * 600 = 2400
    // Local: 2 * 300 = 600
    // Subtotal = 7500, Buffer = 750, Total = 8250 <= 10000 => Fits
    expect(res.cost_breakdown.total_cost).toBe(8250);
    expect(res.feasibility_status).toBe('Fits');
    expect(res.budget_score).toBe(100);
  });

  test('Budget boundary classification: Tight, Over budget, Discard', () => {
    // Base total cost 10,800 (subtotal ~9818) -> let's test tight (up to +10%)
    const tight = calculateBudgetFeasibility({
      budget: 7800,
      travelers: 2,
      days: 2,
      oneWayFarePerPerson: 500,
      hotelCostPerRoomNight: 2500,
      foodCostPerPersonDay: 600,
      localFeesPerPerson: 300,
    });
    // Total 8250 vs 7800 (8250 <= 7800 * 1.10 = 8580) => Tight
    expect(tight.feasibility_status).toBe('Tight');
    expect(tight.budget_score).toBeGreaterThanOrEqual(70);

    const over = calculateBudgetFeasibility({
      budget: 7000,
      travelers: 2,
      days: 2,
      oneWayFarePerPerson: 500,
      hotelCostPerRoomNight: 2500,
      foodCostPerPersonDay: 600,
      localFeesPerPerson: 300,
    });
    // Total 8250 vs 7000 (7000*1.10=7700 < 8250 <= 7000*1.25=8750) => Over budget
    expect(over.feasibility_status).toBe('Over budget');

    const discard = calculateBudgetFeasibility({
      budget: 6000,
      travelers: 2,
      days: 2,
      oneWayFarePerPerson: 500,
      hotelCostPerRoomNight: 2500,
      foodCostPerPersonDay: 600,
      localFeesPerPerson: 300,
    });
    expect(discard.feasibility_status).toBe('Discard');
    expect(discard.budget_score).toBe(0);
  });

  test('Crowd evaluation steps up on weekend/holiday', () => {
    const lowNormal = calculateCrowdEvaluation('Low', false);
    expect(lowNormal.effective_crowd).toBe('Low');
    expect(lowNormal.crowd_score).toBe(100);

    const lowHoliday = calculateCrowdEvaluation('Low', true);
    expect(lowHoliday.effective_crowd).toBe('Medium');
    expect(lowHoliday.crowd_score).toBe(60);

    const medHoliday = calculateCrowdEvaluation('Medium', true);
    expect(medHoliday.effective_crowd).toBe('High');
    expect(medHoliday.crowd_score).toBe(20);
  });

  test('Multi-factor scoring weights add up accurately', () => {
    const scores = calculateMultiFactorScore({
      meaning_match: 90,
      interest_match: 80,
      budget_fit: 100,
      time_fit: 90,
      weather_fit: 100,
      crowd_fit: 60,
    });
    // 27 + 12 + 20 + 9 + 15 + 6 = 89
    expect(scores.final_score).toBe(89);
  });

  test('Transport picker selects cheapest from starting city', () => {
    const opt = selectOptimalTransport(
      [
        { city_name: 'Dhaka', mode: 'Bus', fare_per_person: 800, travel_hours: 6.5 },
        { city_name: 'Dhaka', mode: 'Train', fare_per_person: 500, travel_hours: 6.5 },
        { city_name: 'Sylhet', mode: 'Bus', fare_per_person: 980, travel_hours: 10.5 },
      ],
      'Dhaka',
    );
    expect(opt?.mode).toBe('Train');
    expect(opt?.fare_per_person).toBe(500);
  });

  test('What-If slider updates feasibility and score without changing cost breakdown', () => {
    const baseItem = {
      destination_id: 1,
      name: 'Khulna',
      division: 'Khulna',
      district: 'Khulna',
      description: 'Gateway to Sundarbans',
      latitude: 22.84,
      longitude: 89.54,
      cost_level: 'Medium' as const,
      tags: ['food', 'river'],
      attractions: [],
      selected_transport: {
        city_name: 'Dhaka',
        mode: 'Train' as const,
        fare_per_person: 500,
        travel_hours: 6.5,
      },
      usable_hours: 11,
      min_hours_needed: 10,
      cost_breakdown: {
        round_trip_transport: 2000,
        hotel_stay: 2500,
        rooms_needed: 1,
        nights: 1,
        food_total: 2400,
        local_fees: 600,
        safety_buffer: 750,
        subtotal: 7500,
        total_cost: 8250,
      },
      feasibility_status: 'Tight' as const,
      weather_rating: 5,
      weather_note: 'Pleasant',
      base_crowd: 'Low' as const,
      effective_crowd: 'Low' as const,
      scores: {
        meaning_match: 85,
        interest_match: 80,
        budget_fit: 85,
        time_fit: 80,
        weather_fit: 100,
        crowd_fit: 100,
        final_score: 87.5,
      },
      ai_reason: 'Test',
    };

    const raised = recalculateForBudgetSlider(baseItem, 12000);
    expect(raised.feasibility_status).toBe('Fits');
    expect(raised.scores.budget_fit).toBe(100);
  });

  test('Weather, interest, and cosine similarity utilities', () => {
    expect(calculateWeatherScore(5)).toBe(100);
    expect(calculateInterestScore(['food', 'river'], ['river', 'heritage', 'food'])).toBe(100);
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
});
