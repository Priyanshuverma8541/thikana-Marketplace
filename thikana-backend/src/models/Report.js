const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['listing', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
