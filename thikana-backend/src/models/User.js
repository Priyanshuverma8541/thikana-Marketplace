const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: [String], enum: ['buyer', 'seller', 'admin'], default: ['buyer'] },

    // Seller-facing storefront fields
    storeName: { type: String, trim: true },
    storeSlug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    bio: { type: String, maxlength: 300 },
    avatar: { type: String },
    location: {
      area: { type: String },
      city: { type: String, default: 'Kolkata' },
      lat: Number,
      lng: Number
    },

    verified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
