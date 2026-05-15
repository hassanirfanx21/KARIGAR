// ─── Gemini API Wrapper ─────────────────────────────────────────────────────
// Shared utility for all agents that need LLM calls.
// Uses Gemini 2.0 Flash for speed and cost-efficiency.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Call Gemini with a system prompt and user message.
 * Returns parsed JSON if the response is valid JSON, otherwise raw text.
 *
 * @param {string} systemPrompt - The system instruction for the model
 * @param {string} userMessage  - The user's input
 * @param {object} options      - { temperature, maxTokens }
 * @returns {Promise<{parsed: object|null, raw: string}>}
 */
async function callGemini(systemPrompt, userMessage, options = {}) {
  const { temperature = 0.3, maxTokens = 2048 } = options;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text();

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(text);
    return { parsed, raw: text };
  } catch {
    return { parsed: null, raw: text };
  }
}

/**
 * Call Gemini for free-text responses (not JSON).
 * Used for reasoning explanations, dispute resolutions, etc.
 */
async function callGeminiText(systemPrompt, userMessage, options = {}) {
  const { temperature = 0.5, maxTokens = 1024 } = options;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}

module.exports = { callGemini, callGeminiText };
