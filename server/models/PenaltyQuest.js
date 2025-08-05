const mongoose = require('mongoose');

const penaltyQuestSchema = new mongoose.Schema({
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
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true
    // Removed enum constraint to allow dynamic skills from database
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  // User-specific completion tracking
  completedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    // Track the date (YYYY-MM-DD) when completed for daily reset logic
    completedDate: {
      type: String,
      required: true
    }
  }],
  // Deprecated fields - keeping for backward compatibility
  isAccepted: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for better performance
penaltyQuestSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('PenaltyQuest', penaltyQuestSchema);
