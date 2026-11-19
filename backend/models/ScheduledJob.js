const mongoose = require('mongoose');

// A WhatsApp message that must be sent now or later (order confirmation, abandoned cart).
// Stored in MongoDB, so it survives a server restart. No Redis needed.
const scheduledJobSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. order:123 / abandoned:<checkout token>
    type: { type: String, required: true }, // order_confirmation | abandoned
    status: { type: String, default: 'pending', index: true }, // pending | running | done | skipped | failed
    runAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    shop: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String, default: '' },
    waMessageId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScheduledJob', scheduledJobSchema);
