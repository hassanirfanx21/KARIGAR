require('dotenv').config({ path: __dirname + '/../.env' });
const { orchestrate } = require('../agents/orchestrator');

async function testOrchestrator() {
  const args = process.argv.slice(2);
  const message = args.length > 0 ? args.join(' ') : "g14 mai mechanic need hai kal subah 9 bje ke lye 3000 mai ";

  console.log('====================================================');
  console.log('🤖 Testing Master Orchestrator (Full Pipeline)');
  console.log(`💬 Input Request: "${message}"`);
  console.log('====================================================\n');

  console.log('Running End-to-End Orchestration (Intent -> Discovery -> Ranking -> Pricing -> Booking -> Notification)...\n');
  const startTime = Date.now();

  try {
    // We use a mock user_id for the test
    const result = await orchestrate(message, 'auto', 'test_user_123');

    const duration = Date.now() - startTime;

    if (result.success) {
      console.log('✅ Pipeline Completed Successfully!\n');
      console.log(`📌 Orchestrator Reasoning: "${result.orchestrator_reasoning}"\n`);

      console.log(`👷 Selected Worker: ${result.worker.name} (ID: ${result.worker.worker_id || result.worker.id})`);
      console.log(`💰 Final Price: PKR ${result.pricing.final_price}`);
      console.log(`📅 Booking ID: ${result.booking_id} | Code: ${result.confirmation_code}\n`);

      console.log('🔍 Execution Trace Pipeline:');
      result.trace.forEach((step, index) => {
        console.log(`  [Step ${index + 1}] ${step.agent_name || step.agent} - Status: ${step.status} - Duration: ${step.duration_ms}ms`);
        if (step.output_summary) {
          console.log(`           ↳ Output:`, step.output_summary);
        }
      });

    } else {
      console.log('⚠️ Pipeline Stopped/Failed:');
      console.log('Error/Reason:', result.error || result.status);
      console.log('Message:', result.message || result.clarification?.message);
    }

    console.log(`\n⏱️ Total Execution Time: ${duration}ms`);

  } catch (error) {
    console.error('❌ Error executing Orchestrator pipeline:', error.message);
  }
}

testOrchestrator();
