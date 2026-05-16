const { callGemini } = require('../utils/gemini');

/**
 * Dispute Resolution Agent
 * Analyzes user complaints and determines an automated initial resolution step.
 */
async function resolveDispute({ booking, complaint_text, language = 'roman_urdu' }) {
  const start = Date.now();
  const issue = complaint_text;

  const prompt = `You are the KARIGAR Dispute Resolution Agent.
Your job is to analyze a customer complaint and determine the fairest automated action based on company policy.
The policy states:
- If the worker didn't show up, or caused property damage -> "Refund"
- If the worker couldn't fix the issue, was rude, or lacked skills -> "Re-assign"
- If the dispute is about pricing, external parts, or is unclear -> "Manual Review"

Customer Complaint: "${issue}"

Respond ONLY with a valid JSON object matching this schema:
{
  "classification": "Refund" | "Re-assign" | "Manual Review",
  "reasoning": "A brief 1-sentence explanation of why in ${language === 'roman_urdu' ? 'Roman Urdu' : 'English'}",
  "next_steps": "What happens next in ${language === 'roman_urdu' ? 'Roman Urdu' : 'English'}"
}`;

  try {
    const rawResponse = await callGemini(prompt, { maxTokens: 150 });
    let classification = "Manual Review";
    let reasoning = "Issue requires manual intervention.";
    let next_steps = "Hamari team aapse jald raabta karegi.";

    if (rawResponse) {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        classification = parsed.classification || classification;
        reasoning = parsed.reasoning || reasoning;
        next_steps = parsed.next_steps || next_steps;
      }
    }

    const duration = Date.now() - start;

    return {
      success: true,
      classification,
      reasoning,
      next_steps,
      agent: 'DisputeAgent',
      duration_ms: duration,
      trace: [
        {
          agent_name: 'DisputeAgent',
          status: 'done',
          output_summary: `Classified as ${classification}`,
          duration_ms: duration
        }
      ]
    };
  } catch (error) {
    console.error('[DisputeAgent Error]:', error.message);
    return {
      success: true, // Fallback for demo resilience
      classification: "Manual Review",
      reasoning: "System issue, fallback to human review.",
      next_steps: "Hamari team is masle ko manually review kar rahi hai.",
      agent: 'DisputeAgent',
      duration_ms: Date.now() - start
    };
  }
}

module.exports = { resolveDispute };
