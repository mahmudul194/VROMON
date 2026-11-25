import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PrismaService } from '../database/prisma.service';

const SaveTripSchema = z.object({
  destination_id: z.number().int().positive(),
  title: z.string().min(2),
  query_params: z.any(),
  recommendation_snapshot: z.any(),
  itinerary: z.any().optional(),
});

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.saved_trip.findMany({
      where: { user_id: userId },
      include: {
        destination: {
          select: {
            name: true,
            name_bn: true,
            district: true,
            image_url: true,
            division: { select: { name: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async saveTrip(userId: string, body: z.infer<typeof SaveTripSchema>) {
    return this.prisma.saved_trip.create({
      data: {
        user_id: userId,
        destination_id: body.destination_id,
        title: body.title,
        query_params: body.query_params,
        recommendation_snapshot: body.recommendation_snapshot,
        itinerary: body.itinerary ?? null,
      },
    });
  }

  async removeTrip(userId: string, tripId: string) {
    const existing = await this.prisma.saved_trip.findUnique({ where: { id: tripId } });
    if (!existing || existing.user_id !== userId) {
      throw new NotFoundException('Saved trip not found');
    }
    await this.prisma.saved_trip.delete({ where: { id: tripId } });
    return { deleted: true };
  }
}

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  list(@Req() req: any) {
    return this.tripsService.listForUser(req.user.id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(SaveTripSchema))
  save(@Req() req: any, @Body() body: z.infer<typeof SaveTripSchema>) {
    return this.tripsService.saveTrip(req.user.id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tripsService.removeTrip(req.user.id, id);
  }
}

@Module({
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
