const express = require('express');
const DailyReward = require('../models/DailyReward');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/daily-rewards
// @desc    Get all daily rewards for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const rewards = await DailyReward.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    res.json({
      success: true,
      data: rewards,
      count: rewards.length
    });
  } catch (error) {
    console.error('Error fetching daily rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching daily rewards',
      error: error.message
    });
  }
});

// @route   POST /api/daily-rewards
// @desc    Create a new daily reward for the authenticated user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description'
      });
    }

    // Create new reward with user association
    const newReward = new DailyReward({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user.id
    });

    const savedReward = await newReward.save();
    
    // Populate the createdBy field for response
    await savedReward.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Daily reward created successfully',
      data: savedReward
    });
  } catch (error) {
    console.error('Error creating daily reward:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating daily reward',
      error: error.message
    });
  }
});

// @route   DELETE /api/daily-rewards/:id
// @desc    Delete a daily reward - user can only delete their own rewards
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find reward and verify ownership
    const reward = await DailyReward.findById(id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Daily reward not found'
      });
    }

    // Check if user owns this reward
    if (reward.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own rewards.'
      });
    }

    await DailyReward.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Daily reward deleted successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error deleting daily reward:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting daily reward',
      error: error.message
    });
  }
});

module.exports = router;