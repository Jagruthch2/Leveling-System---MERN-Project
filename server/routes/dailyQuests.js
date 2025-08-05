const express = require('express');
const DailyQuest = require('../models/DailyQuest');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/daily-quests
// @desc    Get all daily quests for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const quests = await DailyQuest.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    res.json({
      success: true,
      data: quests,
      count: quests.length
    });
  } catch (error) {
    console.error('Error fetching daily quests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching daily quests',
      error: error.message
    });
  }
});

// @route   POST /api/daily-quests
// @desc    Create a new daily quest for the authenticated user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, xp, coins, skill } = req.body;

    // Validation
    if (!name || !xp || !coins || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, xp, coins, skill'
      });
    }

    // Create new quest with user association
    const newQuest = new DailyQuest({
      name: name.trim(),
      xp: parseInt(xp),
      coins: parseInt(coins),
      skill: skill.trim(),
      createdBy: req.user.id
    });

    const savedQuest = await newQuest.save();
    
    // Populate the createdBy field for response
    await savedQuest.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Daily quest created successfully',
      data: savedQuest
    });
  } catch (error) {
    console.error('Error creating daily quest:', error);
    
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
      message: 'Server error while creating daily quest',
      error: error.message
    });
  }
});

// @route   PUT /api/daily-quests/:id
// @desc    Update a daily quest (toggle completion) - user can only update their own quests
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;

    // Find quest and verify ownership
    const existingQuest = await DailyQuest.findById(id);
    
    if (!existingQuest) {
      return res.status(404).json({
        success: false,
        message: 'Daily quest not found'
      });
    }

    // Allow any logged-in user to update any quest completion status
    // Removed restriction: existingQuest.createdBy.toString() !== req.user.id

    const quest = await DailyQuest.findByIdAndUpdate(
      id,
      { isCompleted: isCompleted },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Daily quest updated successfully',
      data: quest
    });
  } catch (error) {
    console.error('Error updating daily quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating daily quest',
      error: error.message
    });
  }
});

// @route   DELETE /api/daily-quests/:id
// @desc    Delete a daily quest - user can only delete their own quests
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find quest and verify ownership
    const quest = await DailyQuest.findById(id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Daily quest not found'
      });
    }

    // Check if user owns this quest
    console.log('Delete daily quest debug:');
    console.log('quest.createdBy:', quest.createdBy);
    console.log('quest.createdBy.toString():', quest.createdBy.toString());
    console.log('req.user.id:', req.user.id);
    console.log('req.user.id.toString():', req.user.id.toString());
    console.log('Comparison result:', quest.createdBy.toString() !== req.user.id.toString());
    
    if (quest.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own quests.'
      });
    }

    await DailyQuest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Daily quest deleted successfully',
      data: quest
    });
  } catch (error) {
    console.error('Error deleting daily quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting daily quest',
      error: error.message
    });
  }
});

module.exports = router;
