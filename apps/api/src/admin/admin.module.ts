import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CostLevel } from '@prisma/client';
import { AdminRoleGuard, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [destinationsCount, usersCount, queriesCount, sharedCount, recentQueries, importLogs] =
      await Promise.all([
        this.prisma.destination.count(),
        this.prisma.user.count(),
        this.prisma.query_log.count(),
        this.prisma.shared_plan.count(),
        this.prisma.query_log.findMany({ orderBy: { created_at: 'desc' }, take: 10 }),
        this.prisma.import_log.findMany({ orderBy: { created_at: 'desc' }, take: 5 }),
      ]);

    return {
      totals: {
        destinations: destinationsCount,
        users: usersCount,
        queries: queriesCount,
        shared_plans: sharedCount,
      },
      recent_queries: recentQueries.map((q) => ({
        ...q,
        budget: Number(q.budget),
      })),
      import_logs: importLogs,
    };
  }

  async updateDestination(
    id: number,
    data: {
      hotel_cost_per_room_night?: number;
      food_cost_per_person_day?: number;
      local_fees_per_person?: number;
      min_hours_needed?: number;
      cost_level?: CostLevel;
      description?: string;
    },
  ) {
    return this.prisma.destination.update({
      where: { destination_id: id },
      data,
    });
  }

  async bulkImportDestinations(records: any[]) {
    let loaded = 0;
    const errors: string[] = [];

    for (const r of records) {
      try {
        const div = await this.prisma.division.upsert({
          where: { name: String(r.division).trim() },
          update: {},
          create: { name: String(r.division).trim() },
        });
        await this.prisma.destination.upsert({
          where: { name: String(r.name).trim() },
          update: {
            description: r.description,
            hotel_cost_per_room_night: Number(r.hotel_cost_per_room_night) || 2000,
            food_cost_per_person_day: Number(r.food_cost_per_person_day) || 500,
            local_fees_per_person: Number(r.local_fees_per_person) || 200,
          },
          create: {
            division_id: div.division_id,
            name: String(r.name).trim(),
            name_bn: r.name_bn || null,
            district: r.district || r.name,
            description: r.description || '',
            latitude: Number(r.latitude) || 23.8,
            longitude: Number(r.longitude) || 90.4,
            cost_level: (r.cost_level as CostLevel) || CostLevel.Medium,
            best_months: Array.isArray(r.best_months) ? r.best_months : [11, 12, 1, 2],
            min_hours_needed: Number(r.min_hours_needed) || 12,
            hotel_cost_per_room_night: Number(r.hotel_cost_per_room_night) || 2000,
            food_cost_per_person_day: Number(r.food_cost_per_person_day) || 500,
            local_fees_per_person: Number(r.local_fees_per_person) || 200,
            embedding: [],
          },
        });
        loaded++;
      } catch (e: any) {
        errors.push(`${r.name || 'unknown'}: ${e?.message}`);
      }
    }

    await this.prisma.import_log.create({
      data: {
        file_name: 'admin_json_upload.json',
        records_read: records.length,
        loaded,
        failed: records.length - loaded,
        status: errors.length === 0 ? 'Success' : loaded > 0 ? 'Partial' : 'Failed',
        errors: errors.length > 0 ? errors : undefined,
      },
    });

    return { records_read: records.length, loaded, failed: records.length - loaded, errors };
  }

  async deleteDestination(id: number) {
    await this.prisma.destination.delete({ where: { destination_id: id } });
    return { deleted: true };
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Put('destinations/:id')
  updateDestination(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateDestination(id, body);
  }

  @Post('destinations/bulk')
  bulkImport(@Body() body: { records: any[] }) {
    return this.adminService.bulkImportDestinations(body.records || []);
  }

  @Delete('destinations/:id')
  deleteDestination(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteDestination(id);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
