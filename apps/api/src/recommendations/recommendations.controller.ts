import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { TripQueryInput, TripQueryInputSchema } from '@vromon/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(TripQueryInputSchema))
  async getRecommendations(@Body() body: TripQueryInput) {
    return this.recommendationsService.recommend(body);
  }
}
