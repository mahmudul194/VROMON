import { Body, Controller, Injectable, Module, NotFoundException, Post, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PrismaService } from '../database/prisma.service';

const GenerateItinerarySchema = z.object({
  destination_id: z.number().int().positive(),
  days: z.number().int().min(1).max(15),
  usable_hours: z.number().min(4).max(200),
});

@Injectable()
export class ItinerariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generate(input: z.infer<typeof GenerateItinerarySchema>) {
    const dest = await this.prisma.destination.findUnique({
      where: { destination_id: input.destination_id },
      include: { attractions: true },
    });

    if (!dest) {
      throw new NotFoundException('Destination not found');
    }

    const itinerary = await this.aiService.generateItinerary({
      destinationName: dest.name,
      days: input.days,
      usableHours: input.usable_hours,
      attractions: dest.attractions.map((a) => ({
        name: a.name,
        description: a.description,
        est_hours: Number(a.est_hours),
      })),
    });

    return {
      destination_id: dest.destination_id,
      destination_name: dest.name,
      total_days: input.days,
      usable_hours: input.usable_hours,
      ...itinerary,
    };
  }
}

@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post('generate')
  @UsePipes(new ZodValidationPipe(GenerateItinerarySchema))
  generate(@Body() body: z.infer<typeof GenerateItinerarySchema>) {
    return this.itinerariesService.generate(body);
  }
}

@Module({
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}
