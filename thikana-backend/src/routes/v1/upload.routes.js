const express = require('express');
const multer = require('multer');
const cloudinary = require('../../services/cloudinary.service');
const { success, error } = require('../../utils/response');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/v1/upload — image upload, passes through to Cloudinary
// Frontend can also upload directly to Cloudinary with an unsigned preset to skip this route entirely.
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'NO_FILE', 'No image file provided');
    const result = await cloudinary.uploadBuffer(req.file.buffer);
    return success(res, { url: result.secure_url, publicId: result.public_id }, 201);
  } catch (err) {
    return error(res, 'UPLOAD_FAILED', err.message, 500);
  }
});

module.exports = router;
