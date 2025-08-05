const express = require('express');
const DungeonQuest = require('../models/DungeonQuest');
const User = require('../models/User');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dungeon-quests
// @desc    Get all dungeon quests for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const quests = await DungeonQuest.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    res.json({
      success: true,
      data: quests,
      count: quests.length
    });
  } catch (error) {
    console.error('Error fetching dungeon quests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dungeon quests',
      error: error.message
    });
  }
});

// @route   POST /api/dungeon-quests
// @desc    Create a new dungeon quest for the authenticated user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, xp, coins, skill, title } = req.body;

    // Validation
    if (!name || !xp || !coins || !skill || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, xp, coins, skill, title'
      });
    }

    // Create new quest with user association
    const newQuest = new DungeonQuest({
      name: name.trim(),
      xp: parseInt(xp),
      coins: parseInt(coins),
      skill: skill.trim(),
      title: title.trim(),
      createdBy: req.user.id
    });

    const savedQuest = await newQuest.save();
    
    // Populate the createdBy field for response
    await savedQuest.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Dungeon quest created successfully',
      data: savedQuest
    });
  } catch (error) {
    console.error('Error creating dungeon quest:', error);
    
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
      message: 'Server error while creating dungeon quest',
      error: error.message
    });
  }
});

// @route   PATCH /api/dungeon-quests/:id/complete
// @desc    Complete a dungeon quest and update user profile data
// @access  Private
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find quest and verify ownership
    const quest = await DungeonQuest.findById(id);
    
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon quest not found'
      });
    }

    // Allow any logged-in user to complete any quest
    // Removed restriction: quest.createdBy.toString() !== req.user.id
    
    // Check if quest is already completed
    if (quest.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Quest is already completed'
      });
    }

    // Start transaction to ensure all updates succeed together
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Update quest completion status
      quest.isCompleted = true;
      await quest.save({ session });

      // Update user profile data
      const user = await User.findById(req.user.id).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // 1. Increase user's total XP
      user.totalXp += quest.xp;

      // 2. Increase user's coin count
      user.coins += quest.coins;

      // 3. Add title to user's earned titles if not already present
      const hasTitle = user.titles.some(title => title.name === quest.title);
      if (!hasTitle) {
        user.titles.push({
          name: quest.title,
          source: 'dungeon_quest',
          awardedAt: new Date()
        });
      }

      await user.save({ session });

      // 4. Update skill XP (find or create skill)
      let skill = await Skill.findOne({ 
        createdBy: req.user.id, 
        name: quest.skill 
      }).session(session);

      if (skill) {
        // Skill exists, increase XP
        skill.xp += quest.xp;
        await skill.save({ session });
      } else {
        // Skill doesn't exist, create it with quest XP
        skill = new Skill({
          name: quest.skill,
          xp: quest.xp,
          createdBy: req.user.id
        });
        await skill.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();

      // Populate quest data for response
      await quest.populate('createdBy', 'username');

      res.json({
        success: true,
        message: `Quest completed successfully! You earned ${quest.xp} XP, ${quest.coins} coins, and the title "${quest.title}"`,
        data: {
          quest,
          updatedProfile: {
            totalXp: user.totalXp,
            coins: user.coins,
            newTitle: quest.title,
            skillProgress: {
              skill: skill.name,
              newXp: skill.xp,
              level: Math.floor(skill.xp / 100)
            }
          }
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error completing dungeon quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing dungeon quest',
      error: error.message
    });
  }
});

// @route   PUT /api/dungeon-quests/:id
// @desc    Update a dungeon quest (toggle completion) - user can only update their own quests
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;

    // Find quest and verify ownership
    const existingQuest = await DungeonQuest.findById(id);
    
    if (!existingQuest) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon quest not found'
      });
    }

    // Allow any logged-in user to update any quest completion status
    // Removed restriction: existingQuest.createdBy.toString() !== req.user.id

    const quest = await DungeonQuest.findByIdAndUpdate(
      id,
      { isCompleted: isCompleted },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    // If quest is being completed and has a title, award it to the user
    if (isCompleted && quest.title) {
      try {
        const user = await User.findById(req.user.id);
        
        if (user) {
          // Check if user already has this title
          const hasTitle = user.titles.some(title => title.name === quest.title);
          
          if (!hasTitle) {
            user.titles.push({
              name: quest.title,
              source: 'dungeon_quest',
              awardedAt: new Date()
            });
            
            await user.save();
            console.log(`Title "${quest.title}" awarded to user ${user.username}`);
          }
        }
      } catch (titleError) {
        console.error('Error awarding title:', titleError);
        // Don't fail the quest completion if title awarding fails
      }
    }

    res.json({
      success: true,
      message: `Dungeon quest ${isCompleted ? 'completed' : 'reopened'} successfully${isCompleted && quest.title ? `. Title "${quest.title}" awarded!` : ''}`,
      data: quest
    });
  } catch (error) {
    console.error('Error updating dungeon quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating dungeon quest',
      error: error.message
    });
  }
});

// @route   DELETE /api/dungeon-quests/:id
// @desc    Delete a dungeon quest - user can only delete their own quests
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find quest and verify ownership
    const quest = await DungeonQuest.findById(id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon quest not found'
      });
    }

    // Enhanced ownership check with debug logging
    const questCreatedBy = quest.createdBy.toString();
    const userId = req.user.id.toString();
    
    console.log('DELETE Dungeon Quest - Ownership Check:');
    console.log('Quest createdBy:', questCreatedBy, 'Type:', typeof questCreatedBy);
    console.log('User ID:', userId, 'Type:', typeof userId);
    console.log('Are equal:', questCreatedBy === userId);

    // Check if user owns this quest
    if (questCreatedBy !== userId) {
      console.log('Access denied - user does not own this dungeon quest');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own quests.'
      });
    }

    await DungeonQuest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Dungeon quest deleted successfully',
      data: quest
    });
  } catch (error) {
    console.error('Error deleting dungeon quest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dungeon quest',
      error: error.message
    });
  }
});

module.exports = router;
