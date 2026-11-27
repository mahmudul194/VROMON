import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as path from 'path';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DestinationsModule } from './destinations/destinations.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { MailModule } from './mail/mail.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SharedPlansModule } from './shared-plans/shared-plans.module';
import { TripsModule } from './trips/trips.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'vromon-api', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    MailModule,
    AuthModule,
    AiModule,
    DestinationsModule,
    RecommendationsModule,
    ItinerariesModule,
    SharedPlansModule,
    TripsModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
