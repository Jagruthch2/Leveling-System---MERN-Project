const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    minlength: [2, 'Skill name must be at least 2 characters long'],
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  xp: {
    type: Number,
    default: 0,
    min: [0, 'XP cannot be negative'],
    max: [100000, 'XP cannot exceed 100,000']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Add virtual field for level calculation
skillSchema.virtual('level').get(function() {
  return Math.floor(this.xp / 100);
});

// Ensure virtual fields are serialized
skillSchema.set('toJSON', { virtuals: true });

// Add compound index for better performance and ensure unique skill names per user (case-insensitive)
// This allows different users to have skills with the same name, but prevents the same user from having duplicate skill names
skillSchema.index({ createdBy: 1, name: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 }, // Case-insensitive comparison
  name: 'unique_skill_per_user'
});

// Ensure no global unique constraint on name field alone
// (This comment serves as documentation that name should NOT have a global unique constraint)

module.exports = mongoose.model('Skill', skillSchema);
