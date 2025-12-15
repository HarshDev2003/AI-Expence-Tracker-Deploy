const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  type: {
    type: String,
    enum: ['unusual_amount', 'duplicate', 'suspicious_merchant', 'unusual_category', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'resolved', 'ignored'],
    default: 'new'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

anomalySchema.index({ user: 1, status: 1 });
anomalySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Anomaly', anomalySchema);
