const mongoose = require('mongoose');

// Per-chat bot state. When botPaused is true the bot stays silent for that customer
// (a human replied, or the bot handed the chat over).
const conversationStateSchema = new mongoose.Schema(
  {
    waId: { type: String, required: true, unique: true },
    botPaused: { type: Boolean, default: false },
    pausedReason: { type: String, enum: ['', 'handoff', 'agent'], default: '' },
    pausedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConversationState', conversationStateSchema);
