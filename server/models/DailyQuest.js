const mongoose = require('mongoose');

const dailyQuestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Quest name is required'],
    trim: true,
    minlength: [3, 'Quest name must be at least 3 characters long'],
    maxlength: [100, 'Quest name cannot exceed 100 characters']
  },
  xp: {
    type: Number,
    required: [true, 'XP value is required'],
    min: [1, 'XP must be at least 1'],
    max: [10000, 'XP cannot exceed 10,000']
  },
  coins: {
    type: Number,
    required: [true, 'Coins value is required'],
    min: [1, 'Coins must be at least 1'],
    max: [10000, 'Coins cannot exceed 10,000']
  },
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true
    // Removed enum constraint to allow dynamic skills from database
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Add index for better performance
dailyQuestSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('DailyQuest', dailyQuestSchema);
