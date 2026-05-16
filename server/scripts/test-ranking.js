require('dotenv').config({ path: __dirname + '/../.env' });
const { runRankingAgent } = require('../agents/rankingAgent');

async function testRanking() {
  console.log('----------------------------------------------------');
  console.log('⚖️ Testing Ranking Agent (Agentic Reasoning & Scoring)');
  console.log('----------------------------------------------------\n');

  // Mock user intent (high urgency)
  const mockIntent = {
    service_category: 'hvac',
    service_display: 'AC Technician',
    location: { lat: 33.6310, lng: 73.0140, label: 'G-13, Islamabad' },
    urgency: 'same_day', // Urgent request
    complexity: 'basic',
    budget_hint: null,
  };

  // Mock candidates (discovery output)
  const mockCandidates = [
    {
      id: 'worker_1',
      name: 'Ali Raza',
      category: 'hvac',
      rating: 4.8,
      total_reviews: 120,
      on_time_rate: 95,
      cancellation_rate: 2,
      base_price: 1500,
      distance_km: 8.5, // Farther
      tags: ['top_rated', 'quick_response'],
    },
    {
      id: 'worker_2',
      name: 'Ahmed Khan',
      category: 'hvac',
      rating: 4.2,
      total_reviews: 45,
      on_time_rate: 80,
      cancellation_rate: 10,
      base_price: 1200,
      distance_km: 2.1, // Very close
      tags: [],
    },
    {
      id: 'worker_3',
      name: 'Zain Malik',
      category: 'hvac',
      rating: 4.9,
      total_reviews: 300,
      on_time_rate: 98,
      cancellation_rate: 1,
      base_price: 2000,
      distance_km: 5.0, // Mid distance, high price, excellent stats
      tags: ['expert', 'premium'],
    }
  ];

  console.log('📝 Mock Request Intent (Urgent):');
  console.log(JSON.stringify(mockIntent, null, 2));
  console.log(`\n👷 Input Candidates: ${mockCandidates.length}`);

  console.log('\nCalling Ranking Agent...\n');
  const startTime = Date.now();
  
  try {
    const result = await runRankingAgent({
      candidates: mockCandidates,
      user_request: mockIntent
    });
    
    const duration = Date.now() - startTime;

    console.log('✅ Ranking Results:');
    result.ranked.forEach((worker, index) => {
      console.log(`\nRank #${index + 1}: ${worker.name} (ID: ${worker.worker_id})`);
      console.log(`   Score: ${worker.total_score.toFixed(2)}`);
      console.log(`   Distance: ${worker.distance_km}km | Rating: ${worker.rating}★ | Price: PKR ${worker.base_price}`);
      console.log(`   AI Reasoning: "${worker.reasoning}"`);
      console.log(`   Factor Breakdown:`, worker.factors);
    });
    
    console.log(`\n⏱️ Execution Time: ${duration}ms`);

  } catch (error) {
    console.error('❌ Error testing Ranking Agent:', error.message);
  }
}

testRanking();
