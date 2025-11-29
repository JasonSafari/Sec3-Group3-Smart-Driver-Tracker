const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  createFamily,
  getFamily,
  getMyFamily,
  joinFamily,
  leaveFamily,
  getFamilyMembers
} = require('../controllers/familyController');

// All family routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/families
 * @desc    Create a new family account
 * @access  Private
 */
router.post('/', [
  body('family_name')
    .trim()
    .notEmpty().withMessage('Family name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Family name must be between 1 and 100 characters')
], createFamily);

/**
 * @route   GET /api/families/me
 * @desc    Get current user's family
 * @access  Private
 */
router.get('/me', getMyFamily);

/**
 * @route   GET /api/families/:id
 * @desc    Get family account by ID
 * @access  Private
 */
router.get('/:id', getFamily);

/**
 * @route   GET /api/families/:id/members
 * @desc    Get all members of a family
 * @access  Private
 */
router.get('/:id/members', getFamilyMembers);

/**
 * @route   POST /api/families/join
 * @desc    Join a family using invite code
 * @access  Private
 */
router.post('/join', [
  body('invite_code')
    .trim()
    .notEmpty().withMessage('Invite code is required')
    .isLength({ min: 6, max: 6 }).withMessage('Invite code must be exactly 6 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('Invite code must contain only uppercase letters and numbers')
], joinFamily);

/**
 * @route   POST /api/families/leave
 * @desc    Leave current family
 * @access  Private
 */
router.post('/leave', leaveFamily);

module.exports = router;

