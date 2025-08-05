const express = require('express');
const PenaltyQuest = require('../models/PenaltyQuest');
const User = require('../models/User');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/penalty-quests
// @desc    Get penalty quests created by the authenticated user with completion status
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get only penalty quests created by the current user
    const quests = await PenaltyQuest.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Add user-specific completion status for today
    const questsWithCompletionStatus = quests.map(quest => {
      // Check if the current user completed this quest today
      const todayCompletion = quest.completedBy?.find(
        completion => 
          completion.userId.toString() === req.user.id && 
          completion.completedDate === today
      );
      
      return {
        ...quest,
        isCompletedToday: !!todayCompletion,
        lastCompletedAt: todayCompletion?.completedAt || null,
        // Keep backward compatibility
        isAccepted: !!todayCompletion,
        isCompleted: !!todayCompletion
      };
    });

    res.json({
      success: true,
      data: questsWithCompletionStatus,
      count: questsWithCompletionStatus.length
    });
  } catch (error) {
    console.error('Error fetching penalty quests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching penalty quests',
      error: error.message
    });
  }
});

// @route   POST /api/penalty-quests
// @desc    Create a new penalty quest for the authenticated user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, xp, skill } = req.body;

    // Validation
    if (!name || !xp || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, xp, skill'
      });
    }

    // Create new quest with user association
    const newQuest = new PenaltyQuest({
      name: name.trim(),
      xp: parseInt(xp),
      skill: skill.trim(),
      createdBy: req.user.id
    });

    const savedQuest = await newQuest.save();
    
    // Populate the createdBy field for response
    await savedQuest.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Penalty quest created successfully',
      data: savedQuest
    });
  } catch (error) {
    console.error('Error creating penalty quest:', error);
    
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
      message: 'Server error while creating penalty quest',
      error: error.message
    });
  }
});

// @route   PATCH /api/penalty-quests/:id/accept
// @desc    Accept a penalty quest and award XP (user-specific, daily reset)
// @access  Private
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Find quest and verify ownership
    const quest = await PenaltyQuest.findById(id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Penalty quest not found'
      });
    }

    // Check if user owns this quest
    console.log('Accept penalty quest debug:');
    console.log('quest.createdBy:', quest.createdBy);
    console.log('quest.createdBy.toString():', quest.createdBy.toString());
    console.log('req.user.id:', req.user.id);
    console.log('req.user.id.toString():', req.user.id.toString());
    console.log('Comparison result:', quest.createdBy.toString() !== req.user.id.toString());
    
    if (quest.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only complete your own penalty quests.'
      });
    }

    // Check if user already completed this quest today
    const alreadyCompletedToday = quest.completedBy?.some(
      completion => 
        completion.userId.toString() === req.user.id && 
        completion.completedDate === today
    );

    if (alreadyCompletedToday) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this quest today. It will be available again tomorrow at 12:00 AM.'
      });
    }

    // Add user completion for today
    if (!quest.completedBy) {
      quest.completedBy = [];
    }
    
    quest.completedBy.push({
      userId: req.user.id,
      completedAt: new Date(),
      completedDate: today
    });

    // Update backward compatibility fields
    quest.isAccepted = true;
    quest.isCompleted = true;
    quest.completedAt = new Date();
    
    await quest.save();

    // Update user's total XP and level
    const user = await User.findById(req.user.id);
    const previousXP = user.totalXp || 0;
    const newTotalXP = previousXP + quest.xp;
    
    user.totalXp = newTotalXP;
    await user.save();

    // Update skill XP if skill exists
    let skillUpdateMessage = '';
    if (quest.skill) {
      try {
        const skill = await Skill.findOne({ 
          name: quest.skill, 
          createdBy: req.user.id 
        });
        
        if (skill) {
          const previousSkillXP = skill.xp || 0;
          skill.xp = previousSkillXP + quest.xp;
          skill.level = Math.floor(skill.xp / 100);
          await skill.save();
          skillUpdateMessage = ` Skill '${quest.skill}' updated with +${quest.xp} XP.`;
        }
      } catch (skillError) {
        console.error('Error updating skill:', skillError);
        // Don't fail the quest completion if skill update fails
      }
    }

    await quest.populate('createdBy', 'username');

    res.json({
      success: true,
      message: `Penalty quest completed successfully! Awarded ${quest.xp} XP.${skillUpdateMessage} This quest will be available again tomorrow at 12:00 AM.`,
      data: {
        quest,
        xpAwarded: quest.xp,
        totalXP: newTotalXP,
        level: Math.floor(newTotalXP / 250),
        completedToday: true,
        nextAvailable: 'Tomorrow at 12:00 AM'
      }
    });
  } catch (error) {
    console.error('Error accepting penalty quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting penalty quest',
      error: error.message
    });
  }
});

// @route   DELETE /api/penalty-quests/:id
// @desc    Delete a penalty quest - user can only delete their own quests
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find quest and verify ownership
    const quest = await PenaltyQuest.findById(id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Penalty quest not found'
      });
    }

    // Check if user owns this quest
    console.log('Delete penalty quest debug:');
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

    await PenaltyQuest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Penalty quest deleted successfully',
      data: quest
    });
  } catch (error) {
    console.error('Error deleting penalty quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting penalty quest',
      error: error.message
    });
  }
});

// @route   POST /api/penalty-quests/cleanup
// @desc    Clean up old completion records (called daily at midnight)
// @access  Private (can be called by cron job or admin)
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Get yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Find all penalty quests and remove completion records older than yesterday
    const result = await PenaltyQuest.updateMany(
      {},
      {
        $pull: {
          completedBy: {
            completedDate: { $lt: yesterdayStr }
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cleanup',
      error: error.message
    });
  }
});

module.exports = router;
