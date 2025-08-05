const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ShopItem = require('../models/ShopItem');

// GET /api/shop-items - Get shop items
router.get('/', auth, async (req, res) => {
  try {
    const { showAll } = req.query;
    
    let query = { isActive: true };
    
    // If showAll is not set, only show user's own items (for editor mode)
    if (!showAll) {
      query.createdBy = req.user.id;
    }
    
    const shopItems = await ShopItem.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: shopItems
    });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop items'
    });
  }
});

// POST /api/shop-items - Create a new shop item
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, cost } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    if (!description || !description.trim()) {
      console.log('Validation failed: No description provided');
      return res.status(400).json({
        success: false,
        message: 'Item description is required'
      });
    }

    if (!cost || cost < 1 || cost > 10000) {
      console.log('Validation failed: Invalid cost:', cost);
      return res.status(400).json({
        success: false,
        message: 'Valid cost is required (1-10000 coins)'
      });
    }

    // Create new shop item
    console.log('Creating new shop item...');
    const newItem = new ShopItem({
      name: name.trim(),
      description: description.trim(),
      cost: parseInt(cost),
      createdBy: req.user.id
    });

    console.log('Saving item to database...');
    const savedItem = await newItem.save();
    console.log('Item saved successfully:', savedItem._id);
    
    // Populate the createdBy field for response
    await savedItem.populate('createdBy', 'username');

    console.log('Sending success response');
    res.status(201).json({
      success: true,
      data: savedItem,
      message: 'Shop item created successfully'
    });
  } catch (error) {
    console.error('Error creating shop item:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create shop item'
    });
  }
});

// DELETE /api/shop-items/:id - Delete a shop item (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const shopItem = await ShopItem.findById(id);
    
    if (!shopItem) {
      return res.status(404).json({
        success: false,
        message: 'Shop item not found'
      });
    }

    // Check if user owns the item or is admin (optional)
    console.log('Delete shop item debug:');
    console.log('shopItem.createdBy:', shopItem.createdBy);
    console.log('shopItem.createdBy.toString():', shopItem.createdBy.toString());
    console.log('req.user.id:', req.user.id);
    console.log('req.user.id.toString():', req.user.id.toString());
    console.log('Comparison result:', shopItem.createdBy.toString() !== req.user.id.toString());
    
    if (shopItem.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // Soft delete by setting isActive to false
    shopItem.isActive = false;
    await shopItem.save();

    res.json({
      success: true,
      message: 'Shop item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop item'
    });
  }
});

// PUT /api/shop-items/:id - Update a shop item
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cost } = req.body;

    const shopItem = await ShopItem.findById(id);
    
    if (!shopItem) {
      return res.status(404).json({
        success: false,
        message: 'Shop item not found'
      });
    }

    // Check if user owns the item
    if (shopItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Item name cannot be empty'
        });
      }
      shopItem.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Item description cannot be empty'
        });
      }
      shopItem.description = description.trim();
    }

    if (cost !== undefined) {
      if (cost < 1 || cost > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Cost must be between 1 and 10000 coins'
        });
      }
      shopItem.cost = parseInt(cost);
    }

    const updatedItem = await shopItem.save();
    await updatedItem.populate('createdBy', 'username');

    res.json({
      success: true,
      data: updatedItem,
      message: 'Shop item updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop item:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update shop item'
    });
  }
});

module.exports = router;
