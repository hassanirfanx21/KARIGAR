const { db } = require('../config/firebase');

const WORKERS = [
  {
    name: 'Ali AC Services',
    category: 'ac',
    phone: '03001234567',
    lat: 33.6844, // Islamabad G-13 roughly
    lng: 73.0479,
    base_price: 1500,
    rating: 4.8,
    jobs_completed: 42,
    response_time_mins: 15,
    is_available: true,
    service_radius_km: 15,
    sector: 'G-13, Islamabad',
    skills: ['Split AC', 'Window AC', 'Inverter'],
  },
  {
    name: 'Zain Plumbing',
    category: 'plumber',
    phone: '03001234568',
    lat: 33.6934, // F-11 roughly
    lng: 73.0031,
    base_price: 1000,
    rating: 4.5,
    jobs_completed: 89,
    response_time_mins: 20,
    is_available: true,
    service_radius_km: 10,
    sector: 'F-11, Islamabad',
    skills: ['Pipe Leak', 'Geyser', 'Motor'],
  },
  {
    name: 'Tariq Electrician',
    category: 'electric',
    phone: '03001234569',
    lat: 33.6844, // G-11
    lng: 73.0131,
    base_price: 800,
    rating: 4.9,
    jobs_completed: 120,
    response_time_mins: 10,
    is_available: true,
    service_radius_km: 12,
    sector: 'G-11, Islamabad',
    skills: ['Wiring', 'UPS', 'Breaker'],
  },
  {
    name: 'Kamran AC Experts',
    category: 'ac',
    phone: '03001234570',
    lat: 33.7104, // E-11
    lng: 72.9774,
    base_price: 1800,
    rating: 4.2,
    jobs_completed: 15,
    response_time_mins: 45,
    is_available: true,
    service_radius_km: 8,
    sector: 'E-11, Islamabad',
    skills: ['Gas Filling', 'Installation'],
  },
  {
    name: 'Usman Painter',
    category: 'paint',
    phone: '03001234571',
    lat: 33.6558, // I-8
    lng: 73.0691,
    base_price: 2500,
    rating: 4.6,
    jobs_completed: 55,
    response_time_mins: 30,
    is_available: true,
    service_radius_km: 20,
    sector: 'I-8, Islamabad',
    skills: ['Distemper', 'Enamel', 'Wall Putty'],
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding workers to Firestore...');
  const batch = db.batch();
  const workersRef = db.collection('workers');

  // Clear existing workers
  const existing = await workersRef.get();
  existing.forEach(doc => batch.delete(doc.ref));

  // Add new workers
  WORKERS.forEach(worker => {
    const docRef = workersRef.doc();
    batch.set(docRef, { ...worker, createdAt: new Date().toISOString() });
  });

  await batch.commit();
  console.log(`✅ Seeded ${WORKERS.length} workers successfully!`);
  process.exit(0);
}

seedDatabase().catch(console.error);
