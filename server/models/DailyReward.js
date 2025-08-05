const mongoose = require('mongoose');

const dailyRewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true,
    minlength: [3, 'Reward name must be at least 3 characters'],
    maxlength: [100, 'Reward name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Reward description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create indexes for better query performance
dailyRewardSchema.index({ createdBy: 1, name: 1 });
dailyRewardSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('DailyReward', dailyRewardSchema);