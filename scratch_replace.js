const fs = require('fs');
let c = fs.readFileSync('app/(customer)/agent-working.jsx', 'utf8');

c = c.replace(
  "{ icon: '📅', text: `Booking ID: ${agentResult.booking_id}` },",
  "{ icon: '📅', text: agentResult?.booking?.slot_date || 'Kal 10:00 AM' },\n              { icon: '🎫', text: `ID: ${agentResult?.booking_id}` },"
);

c = c.replace(
  "{ icon: '🔑', text: `Code: ${agentResult.confirmation_code}` },",
  "{ icon: '🔑', text: `Code: ${agentResult?.confirmation_code}` },"
);

c = c.replace(
  "{ icon: '📍', text: agentResult.worker?._raw_worker?.sector || 'Islamabad' },",
  "{ icon: '📍', text: agentResult?.worker?._raw_worker?.sector || 'Islamabad' },"
);

c = c.replace(
  "{ icon: '💰', text: `PKR ${agentResult.pricing?.final_price || 0}` },",
  ""
);

fs.writeFileSync('app/(customer)/agent-working.jsx', c);
