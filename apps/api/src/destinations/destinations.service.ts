import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { division?: string; cost_level?: string; search?: string }) {
    const where: any = {};
    if (filters?.division) {
      where.division = { name: { equals: filters.division, mode: 'insensitive' } };
    }
    if (filters?.cost_level) {
      where.cost_level = filters.cost_level;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { district: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.destination.findMany({
      where,
      include: {
        division: true,
        tags: { include: { tag: true } },
        attractions: true,
        transport_options: { include: { city: true } },
        monthly_conditions: { orderBy: { month_no: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });

    return list.map((d) => ({
      destination_id: d.destination_id,
      name: d.name,
      name_bn: d.name_bn,
      division: d.division.name,
      district: d.district,
      description: d.description,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
      cost_level: d.cost_level,
      best_months: d.best_months,
      min_hours_needed: d.min_hours_needed,
      hotel_cost_per_room_night: Number(d.hotel_cost_per_room_night),
      food_cost_per_person_day: Number(d.food_cost_per_person_day),
      local_fees_per_person: Number(d.local_fees_per_person),
      image_url: d.image_url,
      tags: d.tags.map((dt) => dt.tag.tag_name),
      attractions: d.attractions.map((a) => ({
        ...a,
        est_hours: Number(a.est_hours),
      })),
      transport_options: d.transport_options.map((t) => ({
        mode: t.mode,
        fare_per_person: Number(t.fare_per_person),
        travel_hours: Number(t.travel_hours),
        city_name: t.city.name,
      })),
      monthly_conditions: d.monthly_conditions,
    }));
  }

  async findOne(id: number) {
    const d = await this.prisma.destination.findUnique({
      where: { destination_id: id },
      include: {
        division: true,
        tags: { include: { tag: true } },
        attractions: true,
        transport_options: { include: { city: true } },
        monthly_conditions: { orderBy: { month_no: 'asc' } },
      },
    });
    if (!d) {
      throw new NotFoundException(`Destination #${id} not found`);
    }

    return {
      destination_id: d.destination_id,
      name: d.name,
      name_bn: d.name_bn,
      division: d.division.name,
      district: d.district,
      description: d.description,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
      cost_level: d.cost_level,
      best_months: d.best_months,
      min_hours_needed: d.min_hours_needed,
      hotel_cost_per_room_night: Number(d.hotel_cost_per_room_night),
      food_cost_per_person_day: Number(d.food_cost_per_person_day),
      local_fees_per_person: Number(d.local_fees_per_person),
      image_url: d.image_url,
      tags: d.tags.map((dt) => dt.tag.tag_name),
      attractions: d.attractions.map((a) => ({
        ...a,
        est_hours: Number(a.est_hours),
      })),
      transport_options: d.transport_options.map((t) => ({
        mode: t.mode,
        fare_per_person: Number(t.fare_per_person),
        travel_hours: Number(t.travel_hours),
        city_name: t.city.name,
      })),
      monthly_conditions: d.monthly_conditions,
    };
  }

  async getMeta() {
    const [divisions, startingCities, tags] = await Promise.all([
      this.prisma.division.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.starting_city.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.tag.findMany({ orderBy: { tag_name: 'asc' } }),
    ]);

    return {
      divisions: divisions.map((d) => d.name),
      starting_cities: startingCities.map((c) => c.name),
      tags: tags.map((t) => t.tag_name),
    };
  }
}
