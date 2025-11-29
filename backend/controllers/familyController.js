const { validationResult } = require('express-validator');
const FamilyAccount = require('../models/FamilyAccount');
const User = require('../models/User');

/**
 * Generate a random 6-character invite code
 * Format: A1B2C3 (alphanumeric, uppercase)
 */
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new family account
 * POST /api/families
 */
const createFamily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { family_name } = req.body;
    const userId = req.user.userId;

    // Check if user already belongs to a family
    const user = await User.findByPk(userId);
    if (user.family_id) {
      return res.status(409).json({
        error: 'User already belongs to a family',
        message: 'Leave your current family before creating a new one'
      });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      inviteCode = generateInviteCode();
      const existing = await FamilyAccount.findOne({ where: { invite_code: inviteCode } });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        error: 'Failed to generate unique invite code',
        message: 'Please try again'
      });
    }

    // Create family account
    const family = await FamilyAccount.create({
      family_name,
      invite_code: inviteCode
    });

    // Assign user to the family
    user.family_id = family.family_id;
    await user.save();

    res.status(201).json({
      message: 'Family account created successfully',
      family: {
        family_id: family.family_id,
        family_name: family.family_name,
        invite_code: family.invite_code
      }
    });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({
      error: 'Failed to create family account',
      message: error.message
    });
  }
};

/**
 * Get family account details
 * GET /api/families/:id
 */
const getFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user.family_id || user.family_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own family account'
      });
    }

    const family = await FamilyAccount.findByPk(id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['user_id', 'name', 'email', 'role']
      }]
    });

    if (!family) {
      return res.status(404).json({
        error: 'Family not found'
      });
    }

    res.status(200).json({
      message: 'Family retrieved successfully',
      family
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({
      error: 'Failed to retrieve family',
      message: error.message
    });
  }
};

/**
 * Get current user's family
 * GET /api/families/me
 */
const getMyFamily = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user.family_id) {
      return res.status(404).json({
        error: 'No family found',
        message: 'User does not belong to any family'
      });
    }

    const family = await FamilyAccount.findByPk(user.family_id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['user_id', 'name', 'email', 'role']
      }]
    });

    if (!family) {
      return res.status(404).json({
        error: 'Family not found'
      });
    }

    res.status(200).json({
      message: 'Family retrieved successfully',
      family
    });
  } catch (error) {
    console.error('Get my family error:', error);
    res.status(500).json({
      error: 'Failed to retrieve family',
      message: error.message
    });
  }
};

/**
 * Join a family using invite code
 * POST /api/families/join
 */
const joinFamily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { invite_code } = req.body;
    const userId = req.user.userId;

    // Check if user already belongs to a family
    const user = await User.findByPk(userId);
    if (user.family_id) {
      return res.status(409).json({
        error: 'User already belongs to a family',
        message: 'Leave your current family before joining another'
      });
    }

    // Find family by invite code
    const family = await FamilyAccount.findOne({
      where: { invite_code: invite_code.toUpperCase() }
    });

    if (!family) {
      return res.status(404).json({
        error: 'Invalid invite code',
        message: 'No family found with this invite code'
      });
    }

    // Assign user to family
    user.family_id = family.family_id;
    await user.save();

    res.status(200).json({
      message: 'Successfully joined family',
      family: {
        family_id: family.family_id,
        family_name: family.family_name
      }
    });
  } catch (error) {
    console.error('Join family error:', error);
    res.status(500).json({
      error: 'Failed to join family',
      message: error.message
    });
  }
};

/**
 * Leave current family
 * POST /api/families/leave
 */
const leaveFamily = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user.family_id) {
      return res.status(404).json({
        error: 'Not in a family',
        message: 'User does not belong to any family'
      });
    }

    const familyId = user.family_id;
    user.family_id = null;
    await user.save();

    // Check if family has no more members
    const remainingMembers = await User.count({ where: { family_id: familyId } });
    
    if (remainingMembers === 0) {
      // Optionally delete the family account
      await FamilyAccount.destroy({ where: { family_id: familyId } });
    }

    res.status(200).json({
      message: 'Successfully left family'
    });
  } catch (error) {
    console.error('Leave family error:', error);
    res.status(500).json({
      error: 'Failed to leave family',
      message: error.message
    });
  }
};

/**
 * Get all family members
 * GET /api/families/:id/members
 */
const getFamilyMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user.family_id || user.family_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own family members'
      });
    }

    const members = await User.findAll({
      where: { family_id: id },
      attributes: ['user_id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Family members retrieved successfully',
      members
    });
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({
      error: 'Failed to retrieve family members',
      message: error.message
    });
  }
};

module.exports = {
  createFamily,
  getFamily,
  getMyFamily,
  joinFamily,
  leaveFamily,
  getFamilyMembers
};

