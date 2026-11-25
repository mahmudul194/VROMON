import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { FeasibilityStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PrismaService } from '../database/prisma.service';

const CreateSharedPlanSchema = z.object({
  destination_id: z.number().int().positive(),
  starting_city: z.string().min(2),
  budget: z.number().positive(),
  travelers: z.number().int().positive(),
  days: z.number().int().positive(),
  travel_month: z.number().int().min(1).max(12),
  has_holiday: z.boolean().default(false),
  total_cost: z.number().nonnegative(),
  feasibility_status: z.enum(['Fits', 'Tight', 'Over budget']),
  final_score: z.number().min(0).max(100),
  reason_text: z.string().min(1),
  itinerary: z.any(),
});

@Injectable()
export class SharedPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: z.infer<typeof CreateSharedPlanSchema>) {
    const city = await this.prisma.starting_city.findFirst({
      where: { name: { equals: input.starting_city, mode: 'insensitive' } },
    });

    const cityRecord =
      city ||
      (await this.prisma.starting_city.findFirst()) ||
      (await this.prisma.starting_city.create({ data: { name: input.starting_city } }));

    const shareId = crypto.randomBytes(6).toString('hex'); // 12 char
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const statusEnum =
      input.feasibility_status === 'Over budget'
        ? FeasibilityStatus.Over_budget
        : (input.feasibility_status as FeasibilityStatus);

    const plan = await this.prisma.shared_plan.create({
      data: {
        share_id: shareId,
        destination_id: input.destination_id,
        city_id: cityRecord.city_id,
        budget: input.budget,
        travelers: input.travelers,
        days: input.days,
        travel_month: input.travel_month,
        has_holiday: input.has_holiday,
        total_cost: input.total_cost,
        feasibility_status: statusEnum,
        final_score: input.final_score,
        reason_text: input.reason_text,
        itinerary: input.itinerary,
        expires_at: expiresAt,
      },
      include: {
        destination: { include: { division: true } },
        city: true,
      },
    });

    return {
      share_id: plan.share_id,
      expires_at: plan.expires_at,
    };
  }

  async findByShareId(shareId: string) {
    const plan = await this.prisma.shared_plan.findUnique({
      where: { share_id: shareId },
      include: {
        destination: {
          include: {
            division: true,
            attractions: true,
            tags: { include: { tag: true } },
          },
        },
        city: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Shared trip plan not found');
    }

    if (plan.expires_at < new Date()) {
      throw new NotFoundException('This 30-day shared trip plan has expired');
    }

    return {
      share_id: plan.share_id,
      destination_id: plan.destination_id,
      destination_name: plan.destination.name,
      destination_name_bn: plan.destination.name_bn,
      division: plan.destination.division.name,
      district: plan.destination.district,
      image_url: plan.destination.image_url,
      starting_city: plan.city.name,
      budget: Number(plan.budget),
      travelers: plan.travelers,
      days: plan.days,
      travel_month: plan.travel_month,
      has_holiday: plan.has_holiday,
      total_cost: Number(plan.total_cost),
      feasibility_status:
        plan.feasibility_status === 'Over_budget' ? 'Over budget' : plan.feasibility_status,
      final_score: Number(plan.final_score),
      reason_text: plan.reason_text,
      itinerary: plan.itinerary,
      created_at: plan.created_at,
      expires_at: plan.expires_at,
    };
  }
}

@Controller('shared-plans')
export class SharedPlansController {
  constructor(private readonly sharedPlansService: SharedPlansService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSharedPlanSchema))
  create(@Body() body: z.infer<typeof CreateSharedPlanSchema>) {
    return this.sharedPlansService.create(body);
  }

  @Get(':shareId')
  findOne(@Param('shareId') shareId: string) {
    return this.sharedPlansService.findByShareId(shareId);
  }
}

@Module({
  controllers: [SharedPlansController],
  providers: [SharedPlansService],
})
export class SharedPlansModule {}
