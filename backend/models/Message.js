const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Index is declared once below (schema.index) to avoid Mongoose's duplicate-index warning.
  waMessageId: { type: String },
  waId: { type: String, required: true, index: true },
  contactName: { type: String, default: '' },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  type: { type: String, default: 'text' },
  text: { type: String, default: '' },
  status: { type: String, default: 'received' },
  templateName: { type: String, default: '' },
  campaignName: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  sentBy: { type: String, default: '' }, // 'bot' for AI auto-replies, empty for everything else
  externalRef: { type: String, default: '', index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  raw: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

messageSchema.index({ waMessageId: 1 },{ unique: true, sparse: true });
module.exports = mongoose.model('Message', messageSchema);
