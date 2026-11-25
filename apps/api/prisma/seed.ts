import { PrismaClient, CostLevel, CrowdLevel, TransportMode, UserRole } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

// Curated reliable Unsplash travel photography mapped by destination / dominant tag
const SPECIFIC_IMAGES: Record<string, string> = {
  Dhaka: 'https://images.unsplash.com/photo-1623941000232-3e2d3f039402?auto=format&fit=crop&w=1200&q=80',
  'Cox\'s Bazar': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  Sylhet: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
  Moulvibazar: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  Sreemangal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  Rangamati: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  Bandarban: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  Khagrachhari: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  Sunamganj: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
  Khulna: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  Bagerhat: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  Patuakhali: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
  Rajshahi: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
  Bogura: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
};

function pickImageUrl(name: string, tags: string[]): string {
  if (SPECIFIC_IMAGES[name]) return SPECIFIC_IMAGES[name];
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  if (tagSet.has('sea-beach') || tagSet.has('beach') || tagSet.has('island')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  }
  if (tagSet.has('hills') || tagSet.has('clouds') || tagSet.has('trekking')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';
  }
  if (tagSet.has('tea-gardens') || tagSet.has('tea')) {
    return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
  }
  if (tagSet.has('mangrove') || tagSet.has('forest') || tagSet.has('wildlife')) {
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80';
  }
  if (tagSet.has('heritage') || tagSet.has('history') || tagSet.has('archaeology')) {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
  }
  if (tagSet.has('wetlands') || tagSet.has('haor') || tagSet.has('river')) {
    return 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';
}

function normalizeCostLevel(val: string): CostLevel {
  const clean = String(val || '').trim().toLowerCase();
  if (clean === 'high') return CostLevel.High;
  if (clean === 'medium' || clean === 'moderate') return CostLevel.Medium;
  return CostLevel.Low;
}

function normalizeCrowdLevel(val: string): CrowdLevel {
  const clean = String(val || '').trim().toLowerCase();
  if (clean === 'high') return CrowdLevel.High;
  if (clean === 'medium') return CrowdLevel.Medium;
  return CrowdLevel.Low;
}

function normalizeTransportMode(val: string): TransportMode {
  const clean = String(val || '').trim().toLowerCase();
  if (clean === 'train') return TransportMode.Train;
  if (clean === 'launch') return TransportMode.Launch;
  return TransportMode.Bus;
}

async function generateEmbedding(ai: GoogleGenAI | null, text: string): Promise<number[]> {
  if (!ai) return [];
  const model = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
  const candidateModels = Array.from(new Set([model, 'gemini-embedding-001', 'text-embedding-004']));
  for (const m of candidateModels) {
    try {
      const resp = await ai.models.embedContent({
        model: m,
        contents: text,
      });
      const values = resp.embeddings?.[0]?.values;
      if (values && values.length > 0) {
        return values.slice(0, 768);
      }
    } catch {
      // Try next candidate
    }
  }
  return [];
}

async function main() {
  console.log('Starting VROMON 64-District seed pipeline...');

  const excelPath = path.resolve(__dirname, '../../../VROMON_64_Districts_Dataset.xlsx');
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Dataset file not found at ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const destRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets['Destinations']);
  const attrRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets['Attractions']);
  const transRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets['Transports']);
  const monthRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets['Monthly_Conditions']);

  console.log(
    `Parsed Excel: ${destRows.length} destinations, ${attrRows.length} attractions, ${transRows.length} transports, ${monthRows.length} monthly conditions.`,
  );

  // Seed default Admin and Demo Traveler accounts
  const adminPasswordHash = await bcrypt.hash('VromonAdmin2026!', 10);
  await prisma.user.upsert({
    where: { email: 'mahmudulhaquerifat@gmail.com' },
    update: { role: UserRole.ADMIN, is_verified: true },
    create: {
      email: 'mahmudulhaquerifat@gmail.com',
      name: 'Md. Mahmudul Hoque Rifat',
      password_hash: adminPasswordHash,
      role: UserRole.ADMIN,
      is_verified: true,
      preferred_city: 'Dhaka',
    },
  });

  const travelerHash = await bcrypt.hash('Traveler123!', 10);
  await prisma.user.upsert({
    where: { email: 'traveler@vromon.bd' },
    update: { is_verified: true },
    create: {
      email: 'traveler@vromon.bd',
      name: 'Azwad Nuhan',
      password_hash: travelerHash,
      role: UserRole.TRAVELER,
      is_verified: true,
      preferred_city: 'Dhaka',
    },
  });

  // Upsert divisions
  const divisionSet = new Set(destRows.map((r) => String(r.division).trim()));
  const divisionMap = new Map<string, number>();
  for (const divName of divisionSet) {
    const d = await prisma.division.upsert({
      where: { name: divName },
      update: {},
      create: { name: divName },
    });
    divisionMap.set(divName, d.division_id);
  }

  // Upsert starting cities from Transports
  const citySet = new Set<string>(['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']);
  for (const r of transRows) {
    if (r.from_city) citySet.add(String(r.from_city).trim());
  }
  const cityMap = new Map<string, number>();
  for (const cityName of citySet) {
    const c = await prisma.starting_city.upsert({
      where: { name: cityName },
      update: {},
      create: { name: cityName },
    });
    cityMap.set(cityName, c.city_id);
  }

  // Prepare Gemini AI client for pre-computing destination embeddings
  const apiKey = process.env.GOOGLE_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const destIdMap = new Map<string, number>();

  for (const row of destRows) {
    const name = String(row.destination_name).trim();
    const divId = divisionMap.get(String(row.division).trim());
    if (!divId) continue;

    const tags = String(row.tags || '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const bestMonths = String(row.best_months || '')
      .split(',')
      .map((m) => parseInt(m.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 12);

    const imageUrl = pickImageUrl(name, tags);
    const embedText = `${name} (${row.name_bn || ''}), ${row.district}, ${row.division} division. ${row.description} Tags: ${tags.join(', ')}`;

    const existingDest = await prisma.destination.findUnique({ where: { name } });
    let embedding: number[] = existingDest?.embedding || [];
    if (embedding.length === 0 && ai) {
      embedding = await generateEmbedding(ai, embedText);
    }

    const dest = await prisma.destination.upsert({
      where: { name },
      update: {
        division_id: divId,
        name_bn: row.name_bn ? String(row.name_bn).trim() : null,
        district: String(row.district).trim(),
        description: String(row.description).trim(),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        cost_level: normalizeCostLevel(row.cost_level),
        best_months: bestMonths,
        min_hours_needed: Number(row.min_hours_needed) || 12,
        hotel_cost_per_room_night: Number(row.hotel_cost_per_room_night) || 1800,
        food_cost_per_person_day: Number(row.food_cost_per_person_day) || 500,
        local_fees_per_person: Number(row.local_fees_per_person) || 200,
        image_url: imageUrl,
        embedding,
      },
      create: {
        division_id: divId,
        name,
        name_bn: row.name_bn ? String(row.name_bn).trim() : null,
        district: String(row.district).trim(),
        description: String(row.description).trim(),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        cost_level: normalizeCostLevel(row.cost_level),
        best_months: bestMonths,
        min_hours_needed: Number(row.min_hours_needed) || 12,
        hotel_cost_per_room_night: Number(row.hotel_cost_per_room_night) || 1800,
        food_cost_per_person_day: Number(row.food_cost_per_person_day) || 500,
        local_fees_per_person: Number(row.local_fees_per_person) || 200,
        image_url: imageUrl,
        embedding,
      },
    });
    destIdMap.set(name, dest.destination_id);

    // Sync tags
    for (const tagName of tags) {
      const t = await prisma.tag.upsert({
        where: { tag_name: tagName },
        update: {},
        create: { tag_name: tagName },
      });
      await prisma.destination_tag.upsert({
        where: {
          destination_id_tag_id: {
            destination_id: dest.destination_id,
            tag_id: t.tag_id,
          },
        },
        update: {},
        create: {
          destination_id: dest.destination_id,
          tag_id: t.tag_id,
        },
      });
    }
  }

  // Attractions
  for (const attr of attrRows) {
    const destId = destIdMap.get(String(attr.destination_name).trim());
    if (!destId) continue;
    const attrName = String(attr.attraction_name).trim();
    const estHours = Number(attr.est_hours) || 2.0;

    const exists = await prisma.attraction.findFirst({
      where: { destination_id: destId, name: attrName },
    });
    if (!exists) {
      await prisma.attraction.create({
        data: {
          destination_id: destId,
          name: attrName,
          description: attr.description ? String(attr.description).trim() : null,
          est_hours: estHours,
        },
      });
    }
  }

  // Transports
  for (const tr of transRows) {
    const destId = destIdMap.get(String(tr.destination_name).trim());
    const cityId = cityMap.get(String(tr.from_city).trim());
    if (!destId || !cityId) continue;

    const mode = normalizeTransportMode(tr.mode);
    await prisma.transport_option.upsert({
      where: {
        destination_id_city_id_mode: {
          destination_id: destId,
          city_id: cityId,
          mode,
        },
      },
      update: {
        fare_per_person: Number(tr.fare_per_person) || 500,
        travel_hours: Number(tr.travel_hours) || 5,
      },
      create: {
        destination_id: destId,
        city_id: cityId,
        mode,
        fare_per_person: Number(tr.fare_per_person) || 500,
        travel_hours: Number(tr.travel_hours) || 5,
      },
    });
  }

  // Monthly Conditions
  for (const mc of monthRows) {
    const destId = destIdMap.get(String(mc.destination_name).trim());
    const monthNo = parseInt(mc.month_no, 10);
    if (!destId || Number.isNaN(monthNo)) continue;

    await prisma.monthly_condition.upsert({
      where: {
        destination_id_month_no: {
          destination_id: destId,
          month_no: monthNo,
        },
      },
      update: {
        weather_rating: Number(mc.weather_rating) || 3,
        crowd_level: normalizeCrowdLevel(mc.crowd_level),
        weather_note: mc.weather_note ? String(mc.weather_note).trim() : null,
      },
      create: {
        destination_id: destId,
        month_no: monthNo,
        weather_rating: Number(mc.weather_rating) || 3,
        crowd_level: normalizeCrowdLevel(mc.crowd_level),
        weather_note: mc.weather_note ? String(mc.weather_note).trim() : null,
      },
    });
  }

  // Record import log
  await prisma.import_log.create({
    data: {
      file_name: 'VROMON_64_Districts_Dataset.xlsx',
      records_read: destRows.length,
      loaded: destIdMap.size,
      failed: destRows.length - destIdMap.size,
      status: 'Success',
    },
  });

  console.log(`Seed completed: ${destIdMap.size} destinations loaded.`);
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
