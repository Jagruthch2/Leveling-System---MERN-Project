const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  cost: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
shopItemSchema.index({ createdBy: 1 });
shopItemSchema.index({ isActive: 1 });
shopItemSchema.index({ cost: 1 });

const ShopItem = mongoose.model('ShopItem', shopItemSchema);

module.exports = ShopItem;
