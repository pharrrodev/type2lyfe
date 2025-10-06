const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

// @route   POST /auth/login
// @desc    Login a user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// @route   POST /auth/google
// @desc    Authenticate with Google OAuth
// @access  Public
router.post('/google', [
  body('credential').notEmpty().withMessage('Google credential is required'),
], googleAuth);

module.exports = router;