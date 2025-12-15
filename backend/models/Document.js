const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending'
  },
  merchant: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  amount: {
    type: Number
  },
  currency: {
    type: String,
    default: 'INR'
  },
  transactionDate: {
    type: Date
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
