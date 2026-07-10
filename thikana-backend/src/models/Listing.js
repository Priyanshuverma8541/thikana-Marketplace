const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true }, // category slug
    subcategory: { type: String, required: true }, // subcategory slug
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number },
    images: [{ type: String }], // Cloudinary URLs
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    location: {
      area: { type: String },
      city: { type: String, default: 'Kolkata' },
      lat: Number,
      lng: Number
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'sold'],
      default: 'pending'
    },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

listingSchema.index({ category: 1, subcategory: 1, status: 1 });
listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
