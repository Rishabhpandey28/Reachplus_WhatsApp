const mongoose = require('mongoose');

// Small marker records:
//   wh:<webhook id>        -> Shopify sent the same webhook twice, ignore the copy
//   converted:<checkout>   -> this checkout became an order, so no abandoned-cart message
const shopifyEventSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  topic: { type: String, default: '' },
  shop: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // auto delete after 30 days
});

module.exports = mongoose.model('ShopifyEvent', shopifyEventSchema);
