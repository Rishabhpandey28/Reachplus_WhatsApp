const mongoose = require('mongoose');

// One FAQ / policy / price entry the bot is allowed to answer from.
const knowledgeItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KnowledgeItem', knowledgeItemSchema);
