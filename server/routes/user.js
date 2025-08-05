const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const DailyQuest = require('../models/DailyQuest');
const DungeonQuest = require('../models/DungeonQuest');
const PenaltyQuest = require('../models/PenaltyQuest');
const ShopItem = require('../models/ShopItem');

const router = express.Router();

// GET /api/user/profile - Get user profile with aggregated data
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id; // Fixed: use req.user.id instead of req.user.userId
    
    // Fetch user with titles
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Fetch all quests to calculate total XP and coins
    const [dailyQuests, dungeonQuests, penaltyQuests] = await Promise.all([
      DailyQuest.find({ user: userId }),
      DungeonQuest.find({ user: userId }),
      PenaltyQuest.find({ createdBy: userId })
    ]);

    // Calculate total XP from user's stored totalXp (updated when quests are completed)
    const totalXP = user.totalXp || 0;
    let totalCoins = user.coins || 0; // Use user's actual coin count
    const achievements = new Set();

    // Get quest counts for achievements
    const completedDailyQuests = dailyQuests.filter(quest => quest.isCompleted);
    const completedDungeonQuests = dungeonQuests.filter(quest => quest.isCompleted);

    // Add achievement-based titles
    if (completedDailyQuests.length >= 10) achievements.add('Daily Warrior');
    if (completedDailyQuests.length >= 50) achievements.add('Routine Master');
    if (completedDungeonQuests.length >= 5) achievements.add('Dungeon Slayer');
    if (completedDungeonQuests.length >= 20) achievements.add('Dungeon Master');
    
    // Calculate level and add level-based titles
    const currentLevel = Math.floor(totalXP / 250);
    if (currentLevel >= 50) achievements.add('Elite Hunter');
    if (currentLevel >= 80) achievements.add('Shadow Legion');
    if (totalXP >= 10000) achievements.add('XP Collector');
    
    // Quest completion titles
    const totalCompletedQuests = completedDailyQuests.length + completedDungeonQuests.length;
    if (totalCompletedQuests >= 100) achievements.add('Quest Master');
    if (totalCompletedQuests >= 250) achievements.add('Legendary Achiever');

    // Skill diversity title (if user has used many different skills)
    const skillsUsed = new Set();
    [...dailyQuests, ...dungeonQuests].forEach(quest => {
      if (quest.skill && quest.isCompleted) {
        skillsUsed.add(quest.skill);
      }
    });
    if (skillsUsed.size >= 5) achievements.add('Versatile Hunter');
    if (skillsUsed.size >= 10) achievements.add('Master of All');

    // Get user's earned titles from dungeon quests and other sources
    const userTitles = user.titles || [];
    const earnedTitles = userTitles.map(title => ({
      name: title.name,
      awardedAt: title.awardedAt,
      source: title.source
    }));

    // Build response
    const profileData = {
      name: req.user.username,
      xp: totalXP,
      coins: totalCoins, // Use actual user coins
      achievements: Array.from(achievements), // Achievement-based titles
      titles: earnedTitles, // User's earned titles from completing quests
      level: currentLevel,
      questStats: {
        dailyQuests: {
          total: dailyQuests.length,
          completed: completedDailyQuests.length
        },
        dungeonQuests: {
          total: dungeonQuests.length,
          completed: completedDungeonQuests.length
        },
        penaltyQuests: {
          total: penaltyQuests.length,
          completed: penaltyQuests.filter(quest => quest.isCompleted).length
        }
      }
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// POST /api/user/purchase - Purchase an item from the shop
router.post('/purchase', auth, async (req, res) => {
  try {
    const userId = req.user.id; // Fixed: use req.user.id instead of req.user.userId
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Get the shop item
    const shopItem = await ShopItem.findById(itemId);
    if (!shopItem) {
      return res.status(404).json({
        success: false,
        message: 'Shop item not found'
      });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has enough coins
    if (user.coins < shopItem.cost) {
      return res.status(400).json({
        success: false,
        message: `Not enough coins to buy this item. You need ${shopItem.cost} coins but only have ${user.coins}.`
      });
    }

    // Deduct coins and add item to inventory
    user.coins -= shopItem.cost;
    user.inventory.push({
      name: shopItem.name,
      description: shopItem.description,
      cost: shopItem.cost,
      purchasedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item purchased successfully',
      data: {
        remainingCoins: user.coins,
        purchasedItem: {
          name: shopItem.name,
          description: shopItem.description,
          cost: shopItem.cost
        }
      }
    });

  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase item',
      error: error.message
    });
  }
});

// GET /api/user/inventory - Get user's inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    const userId = req.user.id; // Fixed: use req.user.id instead of req.user.userId
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.inventory || []
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

// PATCH /api/user/inventory/:itemId/use - Mark an inventory item as used
router.patch('/inventory/:itemId/use', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the item in the user's inventory
    const item = user.inventory.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    // Check if item is already used
    if (item.used) {
      return res.status(400).json({
        success: false,
        message: 'Item has already been used'
      });
    }

    // Mark item as used
    item.used = true;
    item.usedAt = new Date();
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item marked as used successfully',
      data: {
        item: item,
        itemId: itemId
      }
    });

  } catch (error) {
    console.error('Error using item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to use item',
      error: error.message
    });
  }
});

// DELETE /api/user/inventory/:itemId - Delete an inventory item
router.delete('/inventory/:itemId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the item in the user's inventory
    const item = user.inventory.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    // Remove the item from inventory
    user.inventory.pull(itemId);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: {
        deletedItemId: itemId,
        itemName: item.name
      }
    });

  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

// POST /api/user/complete-daily-quests - Complete daily quests and distribute rewards
router.post('/complete-daily-quests', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { completedQuestIds, totalXP, totalCoins, skillXPUpdates } = req.body;

    // Validate required data
    if (!completedQuestIds || !Array.isArray(completedQuestIds) || completedQuestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No completed quests provided'
      });
    }

    if (!totalXP || !totalCoins) {
      return res.status(400).json({
        success: false,
        message: 'Missing reward data'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's date string
    const today = new Date().toDateString();
    
    // Initialize dailyQuestCompletions if it doesn't exist
    if (!user.dailyQuestCompletions) {
      user.dailyQuestCompletions = new Map();
    }

    // Check if already completed today
    const todayCompletion = user.dailyQuestCompletions.get(today);
    if (todayCompletion && todayCompletion.finishedToday) {
      return res.status(400).json({
        success: false,
        message: 'Daily quests already completed for today'
      });
    }

    // Update user's total XP and coins
    user.totalXp = (user.totalXp || 0) + totalXP;
    user.coins = (user.coins || 0) + totalCoins;

    // Update skill XP if provided
    if (skillXPUpdates && typeof skillXPUpdates === 'object') {
      if (!user.skillXP) {
        user.skillXP = new Map();
      }
      
      for (const [skillName, xpToAdd] of Object.entries(skillXPUpdates)) {
        user.skillXP.set(skillName, (user.skillXP.get(skillName) || 0) + xpToAdd);
      }
      
      // Mark the skillXP field as modified for Mongoose
      user.markModified('skillXP');
    }

    // Record daily quest completion for this user
    user.dailyQuestCompletions.set(today, {
      completedQuests: completedQuestIds,
      finishedToday: true,
      lastResetDate: today
    });
    
    // Mark the dailyQuestCompletions field as modified for Mongoose
    user.markModified('dailyQuestCompletions');

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Daily quests completed successfully!',
      data: {
        totalXP: user.totalXp,
        coins: user.coins,
        skillXP: Object.fromEntries(user.skillXP),
        addedXP: totalXP,
        addedCoins: totalCoins,
        skillXPUpdates,
        completionDate: today
      }
    });

  } catch (error) {
    console.error('Error completing daily quests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete daily quests',
      error: error.message
    });
  }
});

// GET /api/user/daily-quest-status - Get user's daily quest completion status
router.get('/daily-quest-status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toDateString();

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize dailyQuestCompletions if it doesn't exist
    if (!user.dailyQuestCompletions) {
      user.dailyQuestCompletions = new Map();
    }

    // Get today's completion status
    const todayCompletion = user.dailyQuestCompletions.get(today) || {
      completedQuests: [],
      finishedToday: false,
      lastResetDate: today
    };

    res.status(200).json({
      success: true,
      data: {
        completedQuests: todayCompletion.completedQuests,
        finishedToday: todayCompletion.finishedToday,
        lastResetDate: todayCompletion.lastResetDate,
        currentDate: today
      }
    });

  } catch (error) {
    console.error('Error fetching daily quest status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily quest status',
      error: error.message
    });
  }
});

// POST /api/user/toggle-quest-completion - Toggle individual quest completion
router.post('/toggle-quest-completion', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId } = req.body;
    const today = new Date().toDateString();

    if (!questId) {
      return res.status(400).json({
        success: false,
        message: 'Quest ID is required'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize dailyQuestCompletions if it doesn't exist
    if (!user.dailyQuestCompletions) {
      user.dailyQuestCompletions = new Map();
    }

    // Get today's completion status
    let todayCompletion = user.dailyQuestCompletions.get(today) || {
      completedQuests: [],
      finishedToday: false,
      lastResetDate: today
    };

    // Don't allow toggling if already finished for today
    if (todayCompletion.finishedToday) {
      return res.status(400).json({
        success: false,
        message: 'Daily quests are already finished for today'
      });
    }

    // Toggle quest completion
    const questIndex = todayCompletion.completedQuests.indexOf(questId);
    if (questIndex > -1) {
      // Remove quest from completed list
      todayCompletion.completedQuests.splice(questIndex, 1);
    } else {
      // Add quest to completed list
      todayCompletion.completedQuests.push(questId);
    }

    // Update user's completion data
    user.dailyQuestCompletions.set(today, todayCompletion);
    user.markModified('dailyQuestCompletions');
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quest completion toggled successfully',
      data: {
        completedQuests: todayCompletion.completedQuests,
        finishedToday: todayCompletion.finishedToday,
        questId: questId,
        isCompleted: todayCompletion.completedQuests.includes(questId)
      }
    });

  } catch (error) {
    console.error('Error toggling quest completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle quest completion',
      error: error.message
    });
  }
});

// PUT /api/user/profile - Update user XP and coins (editor mode only)
router.put('/profile', auth, async (req, res) => {
  try {
    const { totalXp, coins } = req.body;
    const userId = req.user.id;

    // Validation
    if (totalXp !== undefined && (typeof totalXp !== 'number' || totalXp < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Total XP must be a non-negative number'
      });
    }

    if (coins !== undefined && (typeof coins !== 'number' || coins < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Coins must be a non-negative number'
      });
    }

    // Find user and update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only provided fields
    if (totalXp !== undefined) {
      user.totalXp = totalXp;
    }
    if (coins !== undefined) {
      user.coins = coins;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        totalXp: user.totalXp,
        coins: user.coins
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// DELETE /api/user/titles/:titleName - Delete a specific title from user's titles
router.delete('/titles/:titleName', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { titleName } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the title to delete
    const titleIndex = user.titles.findIndex(title => title.name === titleName);
    if (titleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }

    // Remove the title
    user.titles.splice(titleIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Title deleted successfully',
      data: {
        deletedTitle: titleName,
        remainingTitles: user.titles
      }
    });

  } catch (error) {
    console.error('Error deleting title:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete title',
      error: error.message
    });
  }
});

module.exports = router;
