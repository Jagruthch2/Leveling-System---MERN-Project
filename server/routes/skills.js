const express = require('express');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/skills
// @desc    Get all skills for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ name: 1 }) // Sort alphabetically by name
      .lean();

    // Add level calculation for each skill
    const skillsWithLevel = skills.map(skill => ({
      ...skill,
      level: Math.floor(skill.xp / 100)
    }));

    res.json({
      success: true,
      data: skillsWithLevel,
      count: skillsWithLevel.length
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skills',
      error: error.message
    });
  }
});

// @route   POST /api/skills
// @desc    Create a new skill for the authenticated user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, xp = 0 } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill name'
      });
    }

    // Check if skill already exists for this user (case-insensitive)
    // This is a user-specific check - skills can have same names across different users
    
    // IMPORTANT: Only check skills belonging to the current user
    const userSpecificSkills = await Skill.find({ createdBy: req.user.id });
    
    // Check for duplicate ONLY within current user's skills
    const duplicateSkillForUser = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      createdBy: req.user.id  // CRITICAL: Only check current user's skills
    });

    if (duplicateSkillForUser) {
      return res.status(400).json({
        success: false,
        message: 'You already have a skill with this name'
      });
    }

    // Create new skill with user association
    const newSkill = new Skill({
      name: name.trim(),
      xp: parseInt(xp) || 0,
      createdBy: req.user.id
    });

    const savedSkill = await newSkill.save();
    
    // Populate the createdBy field for response
    await savedSkill.populate('createdBy', 'username');

    // Add level calculation
    const skillWithLevel = {
      ...savedSkill.toObject(),
      level: Math.floor(savedSkill.xp / 100)
    };

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skillWithLevel
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    if (error.code === 11000) {
      // MongoDB duplicate key error
      // Check if it's our compound index violation (user trying to create duplicate skill)
      if (error.keyPattern && error.keyPattern.createdBy && error.keyPattern.name) {
        return res.status(400).json({
          success: false,
          message: 'You already have a skill with this name'
        });
      }
      
      // If it's some other duplicate key error, provide user-specific message
      return res.status(400).json({
        success: false,
        message: 'You already have a skill with this name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating skill',
      error: error.message
    });
  }
});

// @route   PUT /api/skills/:id
// @desc    Update a skill's XP - user can only update their own skills
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { xp } = req.body;

    if (xp === undefined || xp < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid XP value (0 or greater)'
      });
    }

    // Find skill and verify ownership
    const existingSkill = await Skill.findById(id);
    
    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if user owns this skill
    if (existingSkill.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own skills.'
      });
    }

    const skill = await Skill.findByIdAndUpdate(
      id,
      { xp: parseInt(xp) },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    // Add level calculation
    const skillWithLevel = {
      ...skill.toObject(),
      level: Math.floor(skill.xp / 100)
    };

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skillWithLevel
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating skill',
      error: error.message
    });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill - user can only delete their own skills
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find skill and verify ownership
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if user owns this skill
    if (skill.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own skills.'
      });
    }

    await Skill.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Skill deleted successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting skill',
      error: error.message
    });
  }
});

// @route   POST /api/skills/update-multiple
// @desc    Update XP for multiple skills by name
// @access  Private
router.post('/update-multiple', auth, async (req, res) => {
  try {
    const { skillXPUpdates } = req.body;

    if (!skillXPUpdates || typeof skillXPUpdates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide skillXPUpdates object'
      });
    }

    const updatedSkills = [];
    const errors = [];

    // Process each skill update
    for (const [skillName, xpToAdd] of Object.entries(skillXPUpdates)) {
      try {
        // Find the skill by name for this user
        const skill = await Skill.findOne({
          name: { $regex: new RegExp(`^${skillName.trim()}$`, 'i') },
          createdBy: req.user.id
        });

        if (!skill) {
          errors.push(`Skill "${skillName}" not found`);
          continue;
        }

        // Add XP to existing XP
        const newXP = skill.xp + parseInt(xpToAdd);
        
        // Update the skill
        const updatedSkill = await Skill.findByIdAndUpdate(
          skill._id,
          { xp: newXP },
          { new: true, runValidators: true }
        );

        updatedSkills.push({
          ...updatedSkill.toObject(),
          level: Math.floor(updatedSkill.xp / 100),
          xpAdded: parseInt(xpToAdd)
        });

      } catch (error) {
        errors.push(`Error updating ${skillName}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${updatedSkills.length} skills successfully`,
      data: updatedSkills,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error updating multiple skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating skills',
      error: error.message
    });
  }
});

module.exports = router;
