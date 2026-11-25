import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../database/prisma.service';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService (Golden Scenarios)', () => {
  let service: RecommendationsService;

  const mockDestinations = [
    {
      destination_id: 1,
      name: 'Khulna',
      name_bn: 'খুলনা',
      division: { name: 'Khulna' },
      district: 'Khulna',
      description: "Gateway to the Sundarbans with Tagore's ancestral house and river markets.",
      latitude: 22.8456,
      longitude: 89.5403,
      cost_level: 'Medium',
      best_months: [1, 2, 3, 10, 11, 12],
      min_hours_needed: 10,
      hotel_cost_per_room_night: 2500,
      food_cost_per_person_day: 600,
      local_fees_per_person: 300,
      image_url: 'https://example.com/khulna.jpg',
      embedding: [],
      tags: [{ tag: { tag_name: 'food' } }, { tag: { tag_name: 'river' } }],
      attractions: [
        { attraction_id: 1, name: 'Rupsha River and Bridge', description: 'River promenade', est_hours: 2 },
        { attraction_id: 2, name: 'Khulna Food Walk', description: 'Chui jhal and river fish', est_hours: 2 },
      ],
      transport_options: [
        { mode: 'Train', fare_per_person: 500, travel_hours: 6.5, city: { name: 'Dhaka' } },
        { mode: 'Bus', fare_per_person: 800, travel_hours: 6.5, city: { name: 'Dhaka' } },
      ],
      monthly_conditions: [
        { month_no: 12, weather_rating: 5, weather_note: 'Cool and pleasant', crowd_level: 'Medium' },
      ],
    },
  ];

  const mockPrisma = {
    destination: { findMany: jest.fn().mockResolvedValue(mockDestinations) },
    query_log: { create: jest.fn().mockResolvedValue({}) },
  };

  const mockAiService = {
    extractTravelIntent: jest.fn().mockResolvedValue({
      target_destination_hint: 'Khulna',
      inferred_budget: 10000,
      inferred_travelers: 2,
      inferred_days: null,
      detected_tags: ['food', 'river'],
      detected_mood: 'cultural-food',
      seasonal_hints: [],
      user_questions: {
        asks_places: true,
        asks_food: true,
        asks_budget_sufficiency: true,
        asks_hotel_rates: true,
      },
    }),
    generateQueryEmbedding: jest.fn().mockResolvedValue([]),
    generateGroundedReason: jest
      .fn()
      .mockResolvedValue('Yes, BDT 10,000 is sufficient (est. total BDT 8,250) with room rates around BDT 2,500/night.'),
    buildFallbackReason: jest.fn().mockReturnValue('Fallback reason'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('accurately evaluates the Khulna 10k 2-person benchmark query', async () => {
    const res = await service.recommend({
      wishes:
        'hey i want to go to khulna what are the places to see around, what kind of food i can explore there, i have 10k budget will it be suffecient and we are 2 people where can we stay what are the hotel price rates',
      budget: 15000,
      travelers: 2,
      days: 2,
      travel_month: 12,
      starting_city: 'Dhaka',
      has_holiday: false,
    });

    expect(res.query.budget).toBe(10000);
    expect(res.recommendations).toHaveLength(1);
    const khulna = res.recommendations[0];
    expect(khulna.name).toBe('Khulna');
    expect(khulna.selected_transport.mode).toBe('Train');
    expect(khulna.cost_breakdown.total_cost).toBe(8250);
    expect(khulna.feasibility_status).toBe('Fits');
    expect(khulna.ai_reason).toContain('8,250');
  });
});
