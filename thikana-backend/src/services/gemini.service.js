// Thin wrapper around Gemini's free API.
// Kept isolated so AI calls are never on the critical path -
// callers should treat failures/timeouts as non-fatal.
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function generateListingDraft({ imageBase64, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const body = {
    contents: [
      {
        parts: [
          {
            text:
              'Look at this product photo. Respond ONLY with JSON: ' +
              '{"title": "short catchy title", "description": "2-3 sentence description", ' +
              '"suggestedCategory": "best-guess category name"}. No markdown, no extra text.'
          },
          { inline_data: { mime_type: mimeType, data: imageBase64 } }
        ]
      }
    ]
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generateListingDraft };
