// ─── Quick Test Script for Intent Agent ─────────────────────────────────────
// Run with: node server/scripts/testIntent.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { parseIntent } = require('../agents/intentAgent');

const TEST_CASES = [
  // ── Full valid requests ──
  { message: 'Kal subah AC technician chahiye G-13 mein', language: 'auto' },
  { message: 'I need a plumber urgently in F-8, pipe burst', language: 'auto' },
  { message: 'Bijli ka kaam hai I-10 mein, parson afternoon', language: 'auto' },

  // ── Partial requests (should trigger clarification) ──
  { message: 'AC repair', language: 'auto' },
  { message: 'hello', language: 'auto' },

  // ── Budget + details ──
  { message: 'Painter chahiye G-9, 2 rooms, budget 2000 ke andar', language: 'auto' },
];

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  KARIGAR — Intent Agent Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`\n─── Test ${i + 1}: "${tc.message}" ───`);

    try {
      const result = await parseIntent(tc.message, tc.language);

      if (result.status === 'parsed') {
        console.log(`  ✅ STATUS: Parsed (confidence: ${result.confidence})`);
        console.log(`     Service:  ${result.service_category} → ${result.service_display}`);
        console.log(`     Location: ${result.location?.label || 'N/A'}`);
        console.log(`     Date:     ${result.date || 'N/A'} | Slot: ${result.time_slot?.label || 'N/A'}`);
        console.log(`     Urgency:  ${result.urgency} | Complexity: ${result.complexity}`);
        console.log(`     Budget:   ${result.budget_hint || 'N/A'}`);
        console.log(`     Language: ${result.language_detected}`);
        console.log(`     Notes:    ${result.additional_notes || 'N/A'}`);
      } else {
        console.log(`  ⚠️  STATUS: ${result.status}`);
        console.log(`     Message:  ${result.message}`);
        console.log(`     Missing:  ${result.missing.map(m => m.field).join(', ')}`);
        result.missing.forEach(m => {
          console.log(`       → ${m.field}: "${m.question}"`);
        });
        if (result.partial?.service_category) {
          console.log(`     Partial:  service=${result.partial.service_category}`);
        }
      }
      console.log(`     Duration: ${result.duration_ms}ms`);
    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

runTests();
