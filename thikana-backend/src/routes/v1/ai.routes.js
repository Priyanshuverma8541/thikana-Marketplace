const express = require('express');
const gemini = require('../../services/gemini.service');
const { success, error } = require('../../utils/response');
const { requireAuth } = require('../../middleware/auth');
const { aiLimiter } = require('../../middleware/rateLimit');

const router = express.Router();

// POST /api/v1/ai/draft-listing — { imageBase64, mimeType } -> { title, description, suggestedCategory }
router.post('/draft-listing', requireAuth, aiLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) return error(res, 'MISSING_FIELDS', 'imageBase64 and mimeType are required');

    const draft = await gemini.generateListingDraft({ imageBase64, mimeType });
    return success(res, { draft });
  } catch (err) {
    // AI failures should never block the seller from posting manually
    return error(res, 'AI_UNAVAILABLE', 'Could not generate a draft right now, please fill in manually', 503);
  }
});

module.exports = router;
