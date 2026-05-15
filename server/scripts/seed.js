// ─── Firestore Seed Script (Person B runs this) ────────────────────────────
// Populates the 'workers' collection with 18 mock worker profiles.
// Run with: npm run seed

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { db } = require('../config/firebase');

const WORKERS = [
  // ── HVAC (AC Technicians) ──
  { id: 'wrk_001', name: 'Ali AC Services', phone: '+92-321-1234567', category: 'hvac', tags: ['AC Repair', 'Gas Refilling', 'AC Installation'], sector: 'G-13', lat: 33.6340, lng: 73.0170, service_radius_km: 15, rating: 4.8, total_reviews: 47, last_review_days_ago: 2, completed_jobs: 142, on_time_rate: 0.96, cancellation_rate: 0.02, acceptance_rate: 0.94, base_price: 1500, price_type: 'per_visit', experience_years: 8, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '08:00-18:00', is_available: true, is_verified: true, bio: '8 saal ka tajurba. Split AC, window AC, aur inverter AC repair specialist.' },
  { id: 'wrk_002', name: 'Hassan Cooling Solutions', phone: '+92-333-2345678', category: 'hvac', tags: ['AC Repair', 'AC Cleaning', 'Refrigerator'], sector: 'G-9', lat: 33.6960, lng: 73.0440, service_radius_km: 10, rating: 4.5, total_reviews: 32, last_review_days_ago: 5, completed_jobs: 98, on_time_rate: 0.91, cancellation_rate: 0.05, acceptance_rate: 0.88, base_price: 1200, price_type: 'per_visit', experience_years: 5, available_days: ['mon','tue','wed','thu','fri'], available_hours: '09:00-17:00', is_available: true, is_verified: true, bio: 'AC repair aur cleaning ka kaam. Fridge bhi theek karta hoon.' },
  { id: 'wrk_003', name: 'Tariq HVAC Expert', phone: '+92-345-3456789', category: 'hvac', tags: ['AC Installation', 'Central AC', 'Duct Cleaning'], sector: 'F-10', lat: 33.6950, lng: 73.0280, service_radius_km: 20, rating: 4.2, total_reviews: 21, last_review_days_ago: 12, completed_jobs: 67, on_time_rate: 0.85, cancellation_rate: 0.08, acceptance_rate: 0.82, base_price: 2000, price_type: 'per_visit', experience_years: 12, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '08:00-20:00', is_available: true, is_verified: true, bio: 'Central AC aur commercial projects ka specialist. 12 saal ka tajurba.' },

  // ── Plumbing ──
  { id: 'wrk_004', name: 'Usman Plumbing Works', phone: '+92-300-4567890', category: 'plumbing', tags: ['Pipe Repair', 'Leakage Fix', 'Bathroom Fitting'], sector: 'G-11', lat: 33.6730, lng: 73.0310, service_radius_km: 12, rating: 4.6, total_reviews: 55, last_review_days_ago: 1, completed_jobs: 180, on_time_rate: 0.93, cancellation_rate: 0.03, acceptance_rate: 0.92, base_price: 800, price_type: 'per_visit', experience_years: 10, available_days: ['mon','tue','wed','thu','fri','sat','sun'], available_hours: '07:00-19:00', is_available: true, is_verified: true, bio: 'Har tarah ka plumbing kaam. Emergency services bhi available hain.' },
  { id: 'wrk_005', name: 'Bilal Pipe Master', phone: '+92-312-5678901', category: 'plumbing', tags: ['Pipe Repair', 'Geyser Repair', 'Water Tank'], sector: 'I-8', lat: 33.6870, lng: 73.0800, service_radius_km: 10, rating: 4.3, total_reviews: 28, last_review_days_ago: 7, completed_jobs: 75, on_time_rate: 0.88, cancellation_rate: 0.06, acceptance_rate: 0.85, base_price: 1000, price_type: 'per_visit', experience_years: 6, available_days: ['mon','tue','wed','thu','fri'], available_hours: '08:00-18:00', is_available: true, is_verified: true, bio: 'Geyser aur water tank specialist. Quick service guaranteed.' },
  { id: 'wrk_006', name: 'Faisal Sanitary', phone: '+92-315-6789012', category: 'plumbing', tags: ['Bathroom Fitting', 'Leakage Fix', 'Sewerage'], sector: 'F-8', lat: 33.7100, lng: 73.0480, service_radius_km: 15, rating: 4.0, total_reviews: 15, last_review_days_ago: 20, completed_jobs: 42, on_time_rate: 0.80, cancellation_rate: 0.10, acceptance_rate: 0.78, base_price: 900, price_type: 'per_visit', experience_years: 4, available_days: ['mon','wed','fri','sat'], available_hours: '10:00-18:00', is_available: true, is_verified: true, bio: 'Bathroom renovation aur sanitary fittings.' },

  // ── Electrical ──
  { id: 'wrk_007', name: 'Zain Electric', phone: '+92-321-7890123', category: 'electrical', tags: ['Wiring', 'Switch Board', 'UPS Installation'], sector: 'G-10', lat: 33.6850, lng: 73.0370, service_radius_km: 15, rating: 4.7, total_reviews: 63, last_review_days_ago: 3, completed_jobs: 210, on_time_rate: 0.95, cancellation_rate: 0.02, acceptance_rate: 0.96, base_price: 1200, price_type: 'per_visit', experience_years: 11, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '08:00-20:00', is_available: true, is_verified: true, bio: 'Commercial aur residential wiring. UPS aur solar panel installation.' },
  { id: 'wrk_008', name: 'Kamran Electrician', phone: '+92-333-8901234', category: 'electrical', tags: ['Wiring', 'Generator Repair', 'Fan Installation'], sector: 'I-10', lat: 33.6680, lng: 73.0630, service_radius_km: 10, rating: 4.4, total_reviews: 35, last_review_days_ago: 6, completed_jobs: 95, on_time_rate: 0.90, cancellation_rate: 0.04, acceptance_rate: 0.89, base_price: 1000, price_type: 'per_visit', experience_years: 7, available_days: ['mon','tue','wed','thu','fri'], available_hours: '09:00-18:00', is_available: true, is_verified: true, bio: 'Generator repair aur electrical fault finding expert.' },

  // ── Cleaning ──
  { id: 'wrk_009', name: 'Sparkle Cleaning Co.', phone: '+92-345-9012345', category: 'cleaning', tags: ['Deep Clean', 'Kitchen Clean', 'Full House'], sector: 'G-9', lat: 33.6960, lng: 73.0430, service_radius_km: 20, rating: 4.9, total_reviews: 72, last_review_days_ago: 1, completed_jobs: 250, on_time_rate: 0.98, cancellation_rate: 0.01, acceptance_rate: 0.97, base_price: 2500, price_type: 'per_visit', experience_years: 6, available_days: ['mon','tue','wed','thu','fri','sat','sun'], available_hours: '07:00-20:00', is_available: true, is_verified: true, bio: 'Professional deep cleaning services. Team of 4 trained cleaners.' },
  { id: 'wrk_010', name: 'Clean House Services', phone: '+92-300-0123456', category: 'cleaning', tags: ['Bathroom Clean', 'Kitchen Clean', 'Office Clean'], sector: 'F-7', lat: 33.7230, lng: 73.0590, service_radius_km: 12, rating: 4.1, total_reviews: 18, last_review_days_ago: 14, completed_jobs: 55, on_time_rate: 0.84, cancellation_rate: 0.07, acceptance_rate: 0.80, base_price: 1800, price_type: 'per_visit', experience_years: 3, available_days: ['mon','tue','thu','fri','sat'], available_hours: '09:00-17:00', is_available: true, is_verified: true, bio: 'Office aur ghar dono ki safai ka kaam.' },

  // ── Carpentry ──
  { id: 'wrk_011', name: 'Rashid Furniture Works', phone: '+92-312-1234560', category: 'carpentry', tags: ['Furniture Repair', 'Cabinet Making', 'Door Fix'], sector: 'I-9', lat: 33.6750, lng: 73.0730, service_radius_km: 15, rating: 4.6, total_reviews: 40, last_review_days_ago: 4, completed_jobs: 130, on_time_rate: 0.92, cancellation_rate: 0.03, acceptance_rate: 0.91, base_price: 1500, price_type: 'per_visit', experience_years: 15, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '08:00-18:00', is_available: true, is_verified: true, bio: 'Custom furniture aur repair. 15 saal ka tajurba.' },
  { id: 'wrk_012', name: 'Nadeem Wood Craft', phone: '+92-315-2345670', category: 'carpentry', tags: ['Furniture Repair', 'Wardrobe', 'Kitchen Cabinet'], sector: 'G-8', lat: 33.7080, lng: 73.0510, service_radius_km: 10, rating: 4.3, total_reviews: 22, last_review_days_ago: 10, completed_jobs: 68, on_time_rate: 0.87, cancellation_rate: 0.05, acceptance_rate: 0.86, base_price: 1800, price_type: 'per_visit', experience_years: 9, available_days: ['mon','tue','wed','fri','sat'], available_hours: '09:00-17:00', is_available: true, is_verified: true, bio: 'Kitchen cabinets aur wardrobe ka specialist.' },

  // ── Painting ──
  { id: 'wrk_013', name: 'Color Master Painters', phone: '+92-321-3456780', category: 'painting', tags: ['Interior Paint', 'Exterior Paint', 'Texture'], sector: 'G-13', lat: 33.6280, lng: 73.0110, service_radius_km: 20, rating: 4.5, total_reviews: 38, last_review_days_ago: 3, completed_jobs: 115, on_time_rate: 0.90, cancellation_rate: 0.04, acceptance_rate: 0.88, base_price: 2000, price_type: 'per_room', experience_years: 10, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '07:00-18:00', is_available: true, is_verified: true, bio: 'Interior aur exterior painting. Texture aur POP bhi available.' },

  // ── More HVAC in different sectors (for testing no-match scenario) ──
  { id: 'wrk_014', name: 'Brothers AC Repair', phone: '+92-333-4567890', category: 'hvac', tags: ['AC Repair', 'AC Cleaning'], sector: 'DHA Phase 2', lat: 33.5240, lng: 73.1130, service_radius_km: 8, rating: 3.9, total_reviews: 12, last_review_days_ago: 25, completed_jobs: 30, on_time_rate: 0.78, cancellation_rate: 0.12, acceptance_rate: 0.75, base_price: 1000, price_type: 'per_visit', experience_years: 3, available_days: ['mon','tue','wed','thu','fri'], available_hours: '10:00-16:00', is_available: true, is_verified: true, bio: 'DHA area mein AC repair service.' },

  // ── Unavailable workers (for testing availability filter) ──
  { id: 'wrk_015', name: 'Ahmed Electrician', phone: '+92-345-5678900', category: 'electrical', tags: ['Wiring', 'Switch Board'], sector: 'G-13', lat: 33.6320, lng: 73.0150, service_radius_km: 10, rating: 4.4, total_reviews: 30, last_review_days_ago: 8, completed_jobs: 88, on_time_rate: 0.89, cancellation_rate: 0.05, acceptance_rate: 0.87, base_price: 1100, price_type: 'per_visit', experience_years: 6, available_days: ['mon','tue','wed','thu','fri'], available_hours: '08:00-17:00', is_available: false, is_verified: true, bio: 'Currently on vacation. Back next week.' },

  // ── Unverified worker (should not appear in results) ──
  { id: 'wrk_016', name: 'New Plumber Ali', phone: '+92-300-6789010', category: 'plumbing', tags: ['Pipe Repair'], sector: 'G-11', lat: 33.6740, lng: 73.0300, service_radius_km: 10, rating: 0, total_reviews: 0, last_review_days_ago: 999, completed_jobs: 0, on_time_rate: 0, cancellation_rate: 0, acceptance_rate: 0, base_price: 600, price_type: 'per_visit', experience_years: 1, available_days: ['mon','tue','wed','thu','fri','sat'], available_hours: '09:00-18:00', is_available: true, is_verified: false, bio: 'Naya registered. Verification pending.' },

  // ── Tutoring (rare category — for no-match stress test in some sectors) ──
  { id: 'wrk_017', name: 'Sara Tutor', phone: '+92-312-7890120', category: 'tutoring', tags: ['Mathematics', 'English', 'Science'], sector: 'F-10', lat: 33.6950, lng: 73.0270, service_radius_km: 8, rating: 4.9, total_reviews: 25, last_review_days_ago: 2, completed_jobs: 60, on_time_rate: 0.99, cancellation_rate: 0.01, acceptance_rate: 0.98, base_price: 2000, price_type: 'hourly', experience_years: 5, available_days: ['mon','tue','wed','thu','fri'], available_hours: '14:00-20:00', is_available: true, is_verified: true, bio: 'O-Level aur A-Level Maths, English, Science.' },
  { id: 'wrk_018', name: 'Imran Physics Tutor', phone: '+92-315-8901230', category: 'tutoring', tags: ['Physics', 'Mathematics'], sector: 'F-8', lat: 33.7090, lng: 73.0460, service_radius_km: 10, rating: 4.7, total_reviews: 18, last_review_days_ago: 5, completed_jobs: 45, on_time_rate: 0.95, cancellation_rate: 0.02, acceptance_rate: 0.93, base_price: 2500, price_type: 'hourly', experience_years: 8, available_days: ['mon','wed','fri','sat'], available_hours: '15:00-21:00', is_available: true, is_verified: true, bio: 'FSc aur O-Level Physics specialist.' },
];

async function seed() {
  console.log('🌱 Seeding Firestore with mock workers...\n');

  const batch = db.batch();

  for (const worker of WORKERS) {
    const ref = db.collection('workers').doc(worker.id);
    batch.set(ref, {
      ...worker,
      created_at: new Date().toISOString(),
    });
    console.log(`  ✓ ${worker.id} — ${worker.name} (${worker.category})`);
  }

  await batch.commit();
  console.log(`\n✅ Seeded ${WORKERS.length} workers successfully!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
