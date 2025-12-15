const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'tax', 'subscription', 'insurance', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'dismissed'],
    default: 'pending'
  },
  amount: {
    type: Number
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reminderSchema.index({ user: 1, dueDate: 1 });
reminderSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
