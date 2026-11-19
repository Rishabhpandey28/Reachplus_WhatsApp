const mongoose = require('mongoose');

// One shared contact list. Both the Dashboard and the Contacts (Define Audience)
// page read and write this document, so uploaded data survives a refresh.
const audienceSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    fileName: { type: String, default: '' },
    contacts: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audience', audienceSchema);
