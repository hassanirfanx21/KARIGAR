require('dotenv').config({ path: __dirname + '/../.env' });
const { runIntentAgent } = require('../agents/intentAgent');

async function testIntent() {
  const args = process.argv.slice(2);
  const message = args.length > 0 ? args.join(' ') : "AC kharab hai aur kal mehman aa rahe hain G-13 mein";

  console.log('----------------------------------------------------');
  console.log('🧠 Testing Intent Agent (NLP Parsing)');
  console.log(`💬 Input Message: "${message}"`);
  console.log('----------------------------------------------------\n');

  console.log('Calling Intent Agent...\n');
  const startTime = Date.now();
  
  try {
    const result = await runIntentAgent({ message, language: 'auto' });
    const duration = Date.now() - startTime;

    console.log('✅ Extraction Result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log(`\n⏱️ Execution Time: ${duration}ms`);
    if (result.confidence !== undefined) {
      console.log(`🎯 Confidence Score: ${result.confidence * 100}%`);
    }

  } catch (error) {
    console.error('❌ Error testing Intent Agent:', error.message);
  }
}

testIntent();
