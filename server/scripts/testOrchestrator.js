// ─── Quick Test Script for Orchestrator ─────────────────────────────────────
// Run with: node server/scripts/testOrchestrator.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { processRequest, processComparison } = require('../agents/orchestrator');

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  KARIGAR — Orchestrator End-to-End Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // ── Test 1: Full Pipeline (Request) ──
    console.log('▶️ TEST 1: processRequest (Full Agentic Pipeline)');
    const message = 'Kal subah AC technician chahiye G-13 mein';
    console.log(`Sending message: "${message}"\n`);
    
    const requestResult = await processRequest(message, 'auto', 'test_user_123');
    
    if (requestResult.status === 'workers_found') {
      console.log(`✅ Pipeline Success! Found and ranked ${requestResult.workers.length} workers.`);
      console.log(`\nTop Worker:`);
      const topWorker = requestResult.workers[0];
      if (topWorker) {
        console.log(`  Name: ${topWorker.name} (Score: ${topWorker.total_score})`);
        console.log(`  Price: PKR ${topWorker.pricing.final_price}`);
        console.log(`  Reasoning: "${topWorker.reasoning}"`);
      }
      
      console.log(`\nTrace Length: ${requestResult.trace.length} agent steps recorded.`);
      requestResult.trace.forEach((step, i) => {
        console.log(`  ${i+1}. [${step.agent}] - ${step.duration_ms}ms`);
      });
    } else {
      console.log(`⚠️ Pipeline returned status: ${requestResult.status}`);
      console.dir(requestResult, { depth: null });
    }

    // ── Test 2: Side-by-Side Comparison ──
    console.log('\n\n▶️ TEST 2: processComparison (Agentic vs Baseline)');
    const compareMessage = 'I need a plumber urgently in F-8';
    console.log(`Sending message: "${compareMessage}"\n`);

    const compareResult = await processComparison(compareMessage, 'auto');
    
    if (compareResult.status === 'comparison_complete') {
      console.log(`✅ Comparison Success!`);
      console.log(`\n  🤖 Agentic Pipeline:`);
      console.log(`     Workers found: ${compareResult.agentic.workers.length}`);
      console.log(`     Duration: ${compareResult.agentic.pipeline_duration_ms}ms`);
      
      console.log(`\n  ⚙️ Baseline Pipeline:`);
      console.log(`     Workers found: ${compareResult.baseline.workers.length}`);
      console.log(`     Duration: ${compareResult.baseline.pipeline_duration_ms}ms`);
    } else {
      console.log(`⚠️ Comparison returned status: ${compareResult.status}`);
    }

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

runTests();
