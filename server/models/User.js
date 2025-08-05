const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  coins: {
    type: Number,
    default: 100 // Starting coins for new users
  },
  totalXp: {
    type: Number,
    default: 0,
    min: [0, 'Total XP cannot be negative']
  },
  skillXP: {
    type: Map,
    of: Number,
    default: new Map()
  },
  dailyQuestCompletions: {
    type: Map,
    of: {
      completedQuests: [String], // Array of completed quest IDs
      finishedToday: { type: Boolean, default: false },
      lastResetDate: { type: String, default: () => new Date().toDateString() }
    },
    default: new Map()
  },
  inventory: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    cost: {
      type: Number,
      required: true
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  }],
  titles: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    awardedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      required: true,
      enum: ['daily_quest', 'dungeon_quest', 'level_achievement']
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
