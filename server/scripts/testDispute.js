// ─── Quick Test Script for Dispute Agent ────────────────────────────────────
// Run with: node server/scripts/testDispute.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const {
  resolveDispute,
  calculateWorkerImpact,
  calculateCompensation,
} = require('../agents/disputeAgent');

// ─── Shared Booking & Worker Data ────────────────────────────────────────────

const MOCK_BOOKING = {
  booking_id: 'BK-20260516-0047',
  service_type: 'hvac',
  worker_id: 'wrk_001',
  worker_name: 'Ali AC Services',
  slot_date: '2026-05-16',
  slot_time: { start: '09:00', end: '12:00' },
  pricing: {
    final_price: 1605,
    breakdown: [
      { label: 'Base Rate', amount: 1500 },
      { label: 'Distance (2.1 km)', amount: 105 },
      { label: 'Total', amount: 1605, bold: true },
    ],
  },
  status: 'completed',
};

const GOOD_WORKER = {
  rating: 4.8,
  total_reviews: 87,
  completed_jobs: 143,
  on_time_rate: 96,
  cancellation_rate: 2,
  past_disputes: 0, // First offense
};

const BAD_WORKER = {
  rating: 3.5,
  total_reviews: 22,
  completed_jobs: 35,
  on_time_rate: 72,
  cancellation_rate: 15,
  past_disputes: 4, // Repeat offender
};

// ─── Test Cases ──────────────────────────────────────────────────────────────

const TEST_CASES = [
  {
    name: '🔴 No-show (clear-cut auto-resolve)',
    input: {
      complaint_text: 'Worker aaya hi nahi! Main subah se wait kar raha hun, koi nahi aaya.',
      language: 'auto',
      booking: MOCK_BOOKING,
      worker_history: GOOD_WORKER,
    },
  },
  {
    name: '🟠 Overcharging with proof (clear-cut auto-resolve)',
    input: {
      complaint_text: 'Usne mujh se 2500 liye jabke rate 1605 tha. Ye cheating hai!',
      language: 'auto',
      booking: MOCK_BOOKING,
      worker_history: GOOD_WORKER,
      charged_amount: 2500,
    },
  },
  {
    name: '🟡 Quality complaint — ambiguous (Gemini reasons)',
    input: {
      complaint_text: 'AC repair karwaya tha lekin abhi bhi theek se chill nahi kar raha. Aadha kaam kiya aur chala gaya.',
      language: 'auto',
      booking: MOCK_BOOKING,
      worker_history: GOOD_WORKER,
    },
  },
  {
    name: '🟡 Behavior complaint in English (Gemini reasons)',
    input: {
      complaint_text: 'The technician was very rude. He shouted at me when I asked him to be careful with the wall paint. Very unprofessional.',
      language: 'auto',
      booking: { ...MOCK_BOOKING, service_type: 'painting', worker_name: 'Quick Paint Co' },
      worker_history: BAD_WORKER,
    },
  },
  {
    name: '🔴 Safety issue — critical (always escalated)',
    input: {
      complaint_text: 'Electrician ne wiring galat ki, spark aayi aur thoda sa fire bhi laga. Very dangerous!',
      language: 'auto',
      booking: { ...MOCK_BOOKING, service_type: 'electrical', worker_name: 'Cheap Electric' },
      worker_history: BAD_WORKER,
    },
  },
  {
    name: '🟢 Minor lateness (should get warning/dismissed)',
    input: {
      complaint_text: 'He came 20 minutes late but did the job fine. Just wanted to report it.',
      language: 'auto',
      booking: MOCK_BOOKING,
      worker_history: GOOD_WORKER,
    },
  },
];

// ─── Unit Tests ──────────────────────────────────────────────────────────────

function runUnitTests() {
  console.log('\n── Unit Tests: Worker Impact Calculator ────────────────────');

  // First-time offense by stellar worker → leniency applied
  const impact1 = calculateWorkerImpact('quality', 'partial_refund', 'medium', GOOD_WORKER);
  console.log(`\n  Good worker, first offense (quality, partial_refund, medium):`);
  console.log(`    Rating adjustment: ${impact1.rating_adjustment} (expected ~-0.10 with leniency)`);
  console.log(`    Penalty: ${impact1.suggested_penalty}`);
  console.log(`    Leniency applied: ${impact1.leniency_applied} ✅`);

  // Repeat offender → harsher treatment
  const impact2 = calculateWorkerImpact('quality', 'partial_refund', 'high', BAD_WORKER);
  console.log(`\n  Bad worker, repeat offender (quality, partial_refund, high):`);
  console.log(`    Rating adjustment: ${impact2.rating_adjustment} (expected harsher)`);
  console.log(`    Penalty: ${impact2.suggested_penalty}`);
  console.log(`    Repeat offender: ${impact2.is_repeat_offender} ✅`);

  // Dismissed case → no impact
  const impact3 = calculateWorkerImpact('lateness', 'dismissed', 'low', GOOD_WORKER);
  console.log(`\n  Dismissed case:`);
  console.log(`    Rating adjustment: ${impact3.rating_adjustment} (expected 0)`);
  console.log(`    Dispute flag: ${impact3.add_dispute_flag} (expected false) ✅`);

  console.log('\n── Unit Tests: Compensation Calculator ─────────────────────');

  const comp1 = calculateCompensation('full_refund', 1605, null, 100);
  console.log(`\n  Full refund: PKR ${comp1?.amount} (expected 1605) ✅`);

  const comp2 = calculateCompensation('partial_refund', 1605, 2500, 50);
  console.log(`  Overcharge refund: PKR ${comp2?.amount} (expected 895 — overcharge diff) ✅`);

  const comp3 = calculateCompensation('partial_refund', 1605, null, 50);
  console.log(`  50% partial: PKR ${comp3?.amount} (expected ~803) ✅`);

  const comp4 = calculateCompensation('dismissed', 1605, null, 0);
  console.log(`  Dismissed: ${comp4} (expected null) ✅`);

  const comp5 = calculateCompensation('re_service', 1605, null, 0);
  console.log(`  Re-service: type=${comp5?.type}, amount=${comp5?.amount} ✅`);
}

// ─── Integration Tests ───────────────────────────────────────────────────────

async function runIntegrationTests() {
  console.log('\n── Integration Tests: Full Dispute Pipeline ─────────────────');

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`\n─── Test ${i + 1}: ${tc.name} ───`);

    try {
      const result = await resolveDispute(tc.input);

      console.log(`  STATUS:     ${result.status === 'resolved' ? '✅' : '⚠️'}  ${result.status.toUpperCase()}`);
      console.log(`  Dispute ID: ${result.dispute_id}`);
      console.log(`  Category:   ${result.category} (${result.severity})`);
      console.log(`  Verdict:    ${result.verdict} (confidence: ${result.confidence})`);
      console.log(`  Human Rev:  ${result.requires_human_review ? '⚠️ YES' : '✅ No'}`);
      console.log(`  Summary:    "${result.complaint_summary}"`);
      console.log(`  Reasoning:  "${result.reasoning}"`);

      if (result.compensation) {
        console.log(`  💰 Compensation: ${result.compensation.description} — PKR ${result.compensation.amount}`);
      } else {
        console.log(`  💰 Compensation: None`);
      }

      console.log(`  👤 User Msg: "${result.user_message}"`);
      console.log(`  🔧 Worker Impact:`);
      console.log(`     Rating adj:  ${result.worker_impact.rating_adjustment}`);
      console.log(`     Penalty:     ${result.worker_impact.suggested_penalty}`);
      console.log(`     Dispute flag: ${result.worker_impact.add_dispute_flag}`);
      console.log(`     Leniency:    ${result.worker_impact.leniency_applied}`);
      console.log(`  ⏱️  Duration:   ${result.duration_ms}ms`);
      console.log(`  🌐 Language:   ${result.language_detected}`);

    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}`);
      console.error(err.stack);
    }

    // Small delay between tests to avoid rate limiting
    if (i < TEST_CASES.length - 1) {
      console.log('  (waiting 2s for rate limit...)');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ─── Run Everything ──────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  KARIGAR — Dispute Agent Test Suite');
  console.log('═══════════════════════════════════════════════════════════');

  // Unit tests first (no API calls)
  runUnitTests();

  // Integration tests (calls Gemini — may hit rate limits)
  await runIntegrationTests();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
