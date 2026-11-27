/**
 * VROMON Automated Live End-to-End Capstone Smoke Suite (Phase 5 & Phase 7)
 * Verifies:
 *  1. Health & Security Headers (X-Content-Type-Options, X-Frame-Options)
 *  2. 64-District Catalog + Physical Local Wikimedia Photo Assets
 *  3. Traveler Auth, Profile Update, Google OAuth Redirect & OTP Rate Limiting (429)
 *  4. Khulna 10k 2-Person Golden AI Recommendation + Saved Trips CRUD
 *  5. Day-by-Day Trip Plan Generation + 30-Day Public Shared Plan Link (Logged-Out Read)
 *  6. Admin Dashboard Stats, Live Destination Rate Edit & Persistence, and Bulk JSON Import
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require(path.join(repoRoot, 'apps/api/dist/src/app.module'));

async function request(baseUrl, route, opts = {}) {
  const res = await fetch(`${baseUrl}${route}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // non-json response (e.g., redirect)
  }
  return { status: res.status, headers: res.headers, json, text };
}

(async () => {
  console.log('Booting VROMON NestJS API on ephemeral test port...');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  await app.listen(0, '127.0.0.1');
  const httpServer = app.getHttpServer();
  const port = httpServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`API listening at ${baseUrl}\n`);

  try {
    // 1. Health & Security Headers
    const health = await request(baseUrl, '/health');
    assert.strictEqual(health.status, 200, 'Health endpoint should return 200');
    assert.strictEqual(health.json.status, 'ok');
    assert.strictEqual(health.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(health.headers.get('x-frame-options'), 'DENY');
    console.log('[PASS] 1. Health check & HTTP security headers verified');

    // 2. 64-District Catalog & Local Wikimedia Photo Files
    const destRes = await request(baseUrl, '/destinations');
    assert.strictEqual(destRes.status, 200, 'Destinations catalog should return 200');
    assert(Array.isArray(destRes.json) && destRes.json.length >= 64, 'Expected >= 64 destinations');
    let missingImages = 0;
    for (const d of destRes.json) {
      if (!d.image_url || !d.image_url.startsWith('/images/destinations/')) {
        missingImages++;
      } else {
        const diskPath = path.join(repoRoot, 'apps/web/public', d.image_url);
        if (!fs.existsSync(diskPath)) missingImages++;
      }
    }
    assert.strictEqual(missingImages, 0, 'Every destination must resolve to an existing local Wikimedia photo');
    console.log(`[PASS] 2. ${destRes.json.length} destinations & local Wikimedia photos verified on disk`);

    // 3. Auth Lifecycle, Google OAuth Redirect & Throttler Rate Limit
    const loginRes = await request(baseUrl, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'traveler@vromon.bd', password: 'Traveler123!' }),
    });
    assert(loginRes.status === 200 || loginRes.status === 201, 'Traveler login failed');
    const travelerToken = loginRes.json.access_token;
    assert(travelerToken, 'Traveler JWT missing');

    const meRes = await request(baseUrl, '/auth/me', {
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.json.user.email, 'traveler@vromon.bd');

    const patchRes = await request(baseUrl, '/auth/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({
        name: meRes.json.user.name,
        preferred_city: 'Dhaka',
        budget_tier: 'Medium',
      }),
    });
    assert.strictEqual(patchRes.status, 200);

    const googleRes = await fetch(`${baseUrl}/auth/google`, { redirect: 'manual' });
    assert(
      googleRes.status === 302,
      `Expected 302 redirect from /auth/google, got ${googleRes.status}`,
    );
    console.log('[PASS] 3. Traveler Login, /auth/me, Profile PATCH & Google OAuth 302 redirect verified');

    // 4. Khulna 10k 2-Person Golden Recommendation + Saved Trip CRUD
    const recRes = await request(baseUrl, '/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        wishes:
          'hey i want to go to khulna what are the places to see around, what kind of food i can explore there, i have 10k budget will it be suffecient and we are 2 people where can we stay what are the hotel price rates',
        budget: 15000,
        travelers: 2,
        days: 2,
        travel_month: 12,
        starting_city: 'Dhaka',
        has_holiday: false,
      }),
    });
    assert(recRes.status === 200 || recRes.status === 201, 'Recommendations endpoint failed');
    const topMatch = recRes.json.recommendations[0];
    assert.strictEqual(topMatch.name, 'Khulna', 'Expected Khulna at #1 for explicit Khulna query');
    assert.strictEqual(recRes.json.query.budget, 10000, 'Expected inferred budget 10000 override');
    assert.strictEqual(topMatch.feasibility_status, 'Fits', 'Expected Khulna 10k 2p 2d to be Fits');
    assert(topMatch.ai_reason && topMatch.ai_reason.length > 30, 'Expected grounded AI reason');

    const saveTripRes = await request(baseUrl, '/trips', {
      method: 'POST',
      headers: { Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({
        destination_id: topMatch.destination_id,
        title: 'E2E Smoke Trip to Khulna',
        query_params: recRes.json.query,
        recommendation_snapshot: topMatch,
      }),
    });
    assert(saveTripRes.status === 200 || saveTripRes.status === 201, 'Save trip failed');
    const savedTripId = saveTripRes.json.id;

    const listTripsRes = await request(baseUrl, '/trips', {
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    assert.strictEqual(listTripsRes.status, 200);
    assert(listTripsRes.json.some((t) => t.id === savedTripId), 'Saved trip missing from list');

    const delTripRes = await request(baseUrl, `/trips/${savedTripId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    assert.strictEqual(delTripRes.status, 200);
    console.log(
      `[PASS] 4. Khulna 10k benchmark (${recRes.json.latency_ms}ms, Status: ${topMatch.feasibility_status}, Cost: BDT ${topMatch.cost_breakdown.total_cost}) + Saved Trips CRUD verified`,
    );

    // 5. Day-by-Day Trip Plan + 30-Day Shared Link (Logged-Out View)
    const itinRes = await request(baseUrl, '/itineraries/generate', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: topMatch.destination_id,
        days: 2,
        usable_hours: topMatch.usable_hours,
      }),
    });
    assert(itinRes.status === 200 || itinRes.status === 201, 'Itinerary generation failed');
    assert.strictEqual(itinRes.json.days.length, 2, 'Expected 2-day plan');

    const shareRes = await request(baseUrl, '/shared-plans', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: topMatch.destination_id,
        starting_city: 'Dhaka',
        budget: 10000,
        travelers: 2,
        days: 2,
        travel_month: 12,
        has_holiday: false,
        total_cost: topMatch.cost_breakdown.total_cost,
        feasibility_status: topMatch.feasibility_status,
        final_score: topMatch.scores.final_score,
        reason_text: topMatch.ai_reason,
        itinerary: itinRes.json,
      }),
    });
    assert(shareRes.status === 200 || shareRes.status === 201, 'Shared plan creation failed');
    const shareId = shareRes.json.share_id;
    assert(shareId, 'Missing share_id');

    const publicShareRes = await request(baseUrl, `/shared-plans/${shareId}`);
    assert.strictEqual(publicShareRes.status, 200, 'Public shared plan fetch failed');
    assert.strictEqual(publicShareRes.json.destination_name, 'Khulna');
    console.log(`[PASS] 5. Day-by-Day Trip Plan & 30-day public Shared Link (/plan/${shareId}) verified`);

    // 6. Dedicated Admin Login (/auth/admin/login), Traveler Block (403), Stats, Edit Rate & Bulk Import
    const nonAdminAttempt = await request(baseUrl, '/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'traveler@vromon.bd',
        password: 'Traveler123!',
      }),
    });
    assert.strictEqual(
      nonAdminAttempt.status,
      403,
      `Expected 403 when non-admin logs into /auth/admin/login, got ${nonAdminAttempt.status}`,
    );

    const adminLogin = await request(baseUrl, '/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vromon.bd',
        password: 'VromonAdmin2026!',
      }),
    });
    assert(adminLogin.status === 200 || adminLogin.status === 201, 'Dedicated Admin login failed');
    assert.strictEqual(adminLogin.json.user.role, 'ADMIN');
    const adminToken = adminLogin.json.access_token;

    const statsRes = await request(baseUrl, '/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(statsRes.status, 200);
    assert(statsRes.json.totals.destinations >= 64);

    const origHotelRate = Number(topMatch.cost_breakdown.hotel_stay / Math.max(1, topMatch.cost_breakdown.nights));
    const detailBefore = await request(baseUrl, `/destinations/${topMatch.destination_id}`);
    const exactOrigHotel = Number(detailBefore.json.hotel_cost_per_room_night);

    const tempRate = exactOrigHotel + 100;
    const editRes = await request(baseUrl, `/admin/destinations/${topMatch.destination_id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ hotel_cost_per_room_night: tempRate }),
    });
    assert.strictEqual(editRes.status, 200);

    const detailAfter = await request(baseUrl, `/destinations/${topMatch.destination_id}`);
    assert.strictEqual(Number(detailAfter.json.hotel_cost_per_room_night), tempRate);

    // Restore original rate immediately
    await request(baseUrl, `/admin/destinations/${topMatch.destination_id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ hotel_cost_per_room_night: exactOrigHotel }),
    });

    // Test Bulk JSON Import + cleanup temporary record
    const bulkRes = await request(baseUrl, '/admin/destinations/bulk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        records: [
          {
            name: 'Vromon E2E Temp Sanctuary',
            division: 'Dhaka',
            district: 'Dhaka',
            description: 'Temporary E2E verification destination',
            hotel_cost_per_room_night: 1500,
            food_cost_per_person_day: 500,
            local_fees_per_person: 150,
          },
        ],
      }),
    });
    assert(bulkRes.status === 200 || bulkRes.status === 201);
    assert.strictEqual(bulkRes.json.loaded, 1);

    const allAfterBulk = await request(baseUrl, '/destinations');
    const tempDest = allAfterBulk.json.find((d) => d.name === 'Vromon E2E Temp Sanctuary');
    if (tempDest) {
      const delDest = await request(baseUrl, `/admin/destinations/${tempDest.destination_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(delDest.status, 200);
    }
    console.log('[PASS] 6. Admin stats, live hotel rate edit + DB persistence, and bulk JSON import verified');

    // 7. Throttler OTP Spam Protection Verification (429 Too Many Requests)
    let hit429 = false;
    for (let i = 0; i < 8; i++) {
      const spamRes = await request(baseUrl, '/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent-throttle-check@vromon.bd', purpose: 'REGISTER' }),
      });
      if (spamRes.status === 429) {
        hit429 = true;
        break;
      }
    }
    assert.strictEqual(hit429, true, 'Expected @nestjs/throttler to block OTP spam with HTTP 429');
    console.log('[PASS] 7. @nestjs/throttler OTP rate-limiting verified (HTTP 429 triggered on burst)');

    console.log('\nALL 7 END-TO-END CAPSTONE QA SUITES PASSED!');
    await app.close();
    setTimeout(() => process.exit(0), 250);
  } catch (err) {
    console.error('\nE2E SMOKE SUITE FAILED:', err);
    await app.close().catch(() => {});
    setTimeout(() => process.exit(1), 250);
  }
})();
