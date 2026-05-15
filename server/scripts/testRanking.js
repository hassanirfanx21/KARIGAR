// ─── Quick Test Script for Ranking Agent ────────────────────────────────────
// Run with: node server/scripts/testRanking.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { rankCandidates, scoreDistance, scorePriceMatch } = require('../agents/rankingAgent');

// ─── Mock Discovered Workers (simulating discoveryAgent output) ──────────────
// These match the Firestore workers schema + distance_km added by discoveryAgent

const MOCK_CANDIDATES = [
  {
    worker_id: 'wrk_001',
    name: 'Ali AC Services',
    category: 'hvac',
    tags: ['ac_repair', 'gas_refill', 'split_ac'],
    sector: 'G-11',
    lat: 33.6700, lng: 73.0280,
    distance_km: 2.1,
    rating: 4.8,
    total_reviews: 87,
    last_review_days_ago: 2,
    completed_jobs: 143,
    on_time_rate: 96,
    cancellation_rate: 2,
    acceptance_rate: 94,
    base_price: 1500,
    price_type: 'fixed',
    experience_years: 7,
    available_days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    is_available: true,
    is_verified: true,
    bio: 'Expert AC technician, 7 years experience in G-sector Islamabad.',
  },
  {
    worker_id: 'wrk_002',
    name: 'Shah Cooling Solutions',
    category: 'hvac',
    tags: ['ac_repair', 'ac_installation', 'inverter_ac'],
    sector: 'G-10',
    lat: 33.6820, lng: 73.0340,
    distance_km: 1.4,
    rating: 4.5,
    total_reviews: 42,
    last_review_days_ago: 12,
    completed_jobs: 76,
    on_time_rate: 91,
    cancellation_rate: 6,
    acceptance_rate: 89,
    base_price: 1800,
    price_type: 'fixed',
    experience_years: 4,
    available_days: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
    is_available: true,
    is_verified: true,
    bio: 'Specialized in inverter AC systems.',
  },
  {
    worker_id: 'wrk_003',
    name: 'Premier AC & Refrigeration',
    category: 'hvac',
    tags: ['ac_repair', 'refrigerator', 'split_ac'],
    sector: 'G-9',
    lat: 33.6930, lng: 73.0410,
    distance_km: 4.8,
    rating: 4.9,
    total_reviews: 215,
    last_review_days_ago: 1,
    completed_jobs: 389,
    on_time_rate: 98,
    cancellation_rate: 1,
    acceptance_rate: 97,
    base_price: 2200,
    price_type: 'fixed',
    experience_years: 12,
    available_days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    is_available: true,
    is_verified: true,
    bio: 'Islamabad\'s top-rated AC service with 12 years experience.',
  },
  {
    worker_id: 'wrk_004',
    name: 'Quick Fix AC',
    category: 'hvac',
    tags: ['ac_repair'],
    sector: 'F-11',
    lat: 33.6800, lng: 73.0150,
    distance_km: 7.2,
    rating: 3.9,
    total_reviews: 18,
    last_review_days_ago: 45,
    completed_jobs: 29,
    on_time_rate: 78,
    cancellation_rate: 15,
    acceptance_rate: 72,
    base_price: 1200,
    price_type: 'fixed',
    experience_years: 2,
    available_days: ['Monday','Wednesday','Friday'],
    is_available: true,
    is_verified: false,
    bio: 'Affordable AC repair in F-sector.',
  },
  {
    worker_id: 'wrk_005',
    name: 'CoolBreeze Technicians',
    category: 'hvac',
    tags: ['ac_repair', 'gas_refill'],
    sector: 'I-10',
    lat: 33.6650, lng: 73.0600,
    distance_km: 5.5,
    rating: 4.3,
    total_reviews: 61,
    last_review_days_ago: 8,
    completed_jobs: 102,
    on_time_rate: 88,
    cancellation_rate: 5,
    acceptance_rate: 91,
    base_price: 1400,
    price_type: 'fixed',
    experience_years: 5,
    available_days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    is_available: true,
    is_verified: true,
    bio: 'Fast gas refill and AC repair specialists.',
  },
  {
    worker_id: 'wrk_006',
    name: 'AirMaster Services',
    category: 'hvac',
    tags: ['ac_installation', 'ac_repair'],
    sector: 'G-14',
    lat: 33.6150, lng: 73.0050,
    distance_km: 11.3,
    rating: 4.1,
    total_reviews: 29,
    last_review_days_ago: 22,
    completed_jobs: 55,
    on_time_rate: 84,
    cancellation_rate: 8,
    acceptance_rate: 85,
    base_price: 1350,
    price_type: 'fixed',
    experience_years: 3,
    available_days: ['Tuesday','Thursday','Saturday'],
    is_available: true,
    is_verified: false,
    bio: 'Installation and repair specialist.',
  },
  {
    worker_id: 'wrk_007',
    name: 'Frosty Air Experts',
    category: 'hvac',
    tags: ['ac_repair', 'split_ac', 'window_ac'],
    sector: 'G-15',
    lat: 33.6000, lng: 72.9950,
    distance_km: 14.7,
    rating: 4.6,
    total_reviews: 55,
    last_review_days_ago: 5,
    completed_jobs: 88,
    on_time_rate: 93,
    cancellation_rate: 3,
    acceptance_rate: 92,
    base_price: 1600,
    price_type: 'fixed',
    experience_years: 6,
    available_days: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
    is_available: false, // Currently unavailable
    is_verified: true,
    bio: 'All types of AC repair.',
  },
];

// ─── Mock User Requests ──────────────────────────────────────────────────────

const TEST_CASES = [
  {
    name: 'Standard AC request — no budget',
    input: {
      candidates: MOCK_CANDIDATES,
      user_request: {
        service_category: 'hvac',
        service_display: 'AC Technician',
        location: { lat: 33.6310, lng: 73.0140, label: 'G-13, Islamabad' },
        date: '2026-05-17',
        time_slot: { start: '09:00', end: '12:00', label: 'Subah (Morning)' },
        urgency: 'next_day',
        budget_hint: null,
        tags: ['ac_repair', 'split_ac'],
      },
    },
  },
  {
    name: 'Budget-constrained request (PKR 1500)',
    input: {
      candidates: MOCK_CANDIDATES,
      user_request: {
        service_category: 'hvac',
        service_display: 'AC Technician',
        location: { lat: 33.6310, lng: 73.0140, label: 'G-13, Islamabad' },
        date: '2026-05-17',
        time_slot: { start: '09:00', end: '12:00', label: 'Subah (Morning)' },
        urgency: 'next_day',
        budget_hint: 1500,
        tags: ['ac_repair'],
      },
    },
  },
  {
    name: 'Edge case — empty candidates list',
    input: {
      candidates: [],
      user_request: {
        service_category: 'hvac',
        service_display: 'AC Technician',
        location: { lat: 33.6310, lng: 73.0140, label: 'G-13, Islamabad' },
        urgency: 'same_day',
        budget_hint: null,
        tags: [],
      },
    },
  },
];

// ─── Unit Tests for Scorers ──────────────────────────────────────────────────

function runUnitTests() {
  console.log('\n── Unit Tests: Individual Scorers ───────────────────────────');

  const distanceTests = [
    [0.5, 100], [2.0, 90], [4.0, 77], [8.0, 56], [12.0, 38], [20.0, 10],
  ];
  console.log('\n  Distance Scorer:');
  distanceTests.forEach(([km, expected]) => {
    const { score } = scoreDistance(km);
    const pass = Math.abs(score - expected) <= 5; // Allow ±5 tolerance
    console.log(`    ${pass ? '✅' : '⚠️'} ${km} km → score: ${score} (expected ~${expected})`);
  });

  console.log('\n  Price Match Scorer:');
  const priceTests = [
    [1200, 1500, '✅ under budget'],
    [1500, 1500, '✅ exact budget'],
    [2000, 1500, '⚠️ over budget'],
    [1500, null, '➖ no budget set'],
  ];
  priceTests.forEach(([price, budget, label]) => {
    const { score, raw } = scorePriceMatch(price, budget);
    console.log(`    ${label}: PKR ${price} vs budget PKR ${budget || 'N/A'} → score: ${score} (${raw})`);
  });
}

// ─── Integration Tests ───────────────────────────────────────────────────────

async function runIntegrationTests() {
  console.log('\n── Integration Tests: Full Ranking Pipeline ─────────────────');

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`\n─── Test ${i + 1}: ${tc.name} ───`);

    try {
      const result = await rankCandidates(tc.input);

      if (result.status === 'no_candidates') {
        console.log(`  ✅ Handled empty candidates correctly`);
        continue;
      }

      console.log(`  ✅ STATUS: ${result.status}`);
      console.log(`     Total candidates scored: ${result.total_candidates}`);
      console.log(`     Top ${result.ranked.length} returned:`);
      console.log('');

      result.ranked.forEach((w, rank) => {
        console.log(`     #${rank + 1} ${w.name} — Score: ${w.total_score}/100`);
        console.log(`            Distance:   ${w.factors.distance.raw} (score: ${w.factors.distance.score})`);
        console.log(`            Rating:     ${w.factors.rating.raw} (score: ${w.factors.rating.score})`);
        console.log(`            Price:      ${w.factors.price_match.raw} (score: ${w.factors.price_match.score})`);
        console.log(`            Reliability:${w.factors.reliability.raw} (score: ${w.factors.reliability.score})`);
        console.log(`            Reasoning:  "${w.reasoning}"`);
        console.log('');
      });

      console.log(`     Duration: ${result.duration_ms}ms`);

    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}`);
      console.error(err.stack);
    }
  }
}

// ─── Run Everything ──────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  KARIGAR — Ranking Agent Test Suite');
  console.log('═══════════════════════════════════════════════════════════');

  // Unit tests first (no API calls)
  runUnitTests();

  // Integration tests (calls Gemini for reasoning)
  await runIntegrationTests();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
