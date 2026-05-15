// ─── Pricing Agent (Person B) ───────────────────────────────────────────────
// Calculates dynamic pricing with a transparent, itemized breakdown.
//
// Formula:
//   final = (base + distance_surcharge) × urgency_mult × complexity_mult × loyalty_mult
//
// Input:  { worker_base_price, distance_km, urgency, complexity, is_returning_user }
// Output: { final_price, breakdown: [...] }

/**
 * Urgency multipliers.
 */
const URGENCY_MULTIPLIERS = {
  same_day: 1.3,
  next_day: 1.0,
  later: 0.95,
};

/**
 * Complexity multipliers.
 */
const COMPLEXITY_MULTIPLIERS = {
  basic: 1.0,
  intermediate: 1.3,
  complex: 1.6,
};

/**
 * Distance surcharge: PKR 50 per km.
 */
const DISTANCE_RATE = 50;

/**
 * Loyalty discount percentage for returning users.
 */
const LOYALTY_DISCOUNT = 0.10;

/**
 * Run the Pricing Agent.
 *
 * @param {object} input
 * @param {number} input.worker_base_price - Worker's base price in PKR
 * @param {number} input.distance_km       - Distance from user to worker in km
 * @param {string} input.urgency           - "same_day" | "next_day" | "later"
 * @param {string} input.complexity        - "basic" | "intermediate" | "complex"
 * @param {boolean} input.is_returning_user - Whether user has booked before
 * @returns {{ final_price: number, breakdown: Array, agent: string, duration_ms: number }}
 */
function runPricingAgent(input) {
  const startTime = Date.now();
  const {
    worker_base_price,
    distance_km,
    urgency = 'next_day',
    complexity = 'basic',
    is_returning_user = false,
  } = input;

  // ── Calculate each component ──────────────────────────────────────────
  const distanceSurcharge = Math.round(DISTANCE_RATE * distance_km);
  const urgencyMult = URGENCY_MULTIPLIERS[urgency] || 1.0;
  const complexityMult = COMPLEXITY_MULTIPLIERS[complexity] || 1.0;

  // Subtotal before loyalty
  const subtotal = Math.round((worker_base_price + distanceSurcharge) * urgencyMult * complexityMult);

  // Loyalty discount
  const loyaltyDiscount = is_returning_user ? Math.round(subtotal * LOYALTY_DISCOUNT) : 0;
  const finalPrice = subtotal - loyaltyDiscount;

  // ── Build itemized breakdown ──────────────────────────────────────────
  const breakdown = [
    { label: 'Base Rate', amount: worker_base_price },
    { label: `Distance (${distance_km} km)`, amount: distanceSurcharge },
    { label: `Urgency (${capitalize(urgency.replace('_', ' '))})`, multiplier: urgencyMult },
    { label: `Complexity (${capitalize(complexity)})`, multiplier: complexityMult },
    { label: 'Loyalty Discount', amount: -loyaltyDiscount },
    { label: 'Total', amount: finalPrice, bold: true },
  ];

  return {
    final_price: finalPrice,
    breakdown,
    agent: 'pricing',
    reasoning: `Base PKR ${worker_base_price} + ${distanceSurcharge} distance → ×${urgencyMult} urgency ×${complexityMult} complexity${is_returning_user ? ' − 10% loyalty' : ''} = PKR ${finalPrice}`,
    duration_ms: Date.now() - startTime,
  };
}

/**
 * Capitalize first letter.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { runPricingAgent };
