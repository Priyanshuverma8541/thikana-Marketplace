const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    attrs: [{ type: String }] // e.g. ["bhk", "rent", "furnishing"]
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: '' }, // emoji or icon key
    isActive: { type: Boolean, default: true },
    subcategories: [subcategorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
