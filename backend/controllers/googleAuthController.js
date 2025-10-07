const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google OAuth token and create/login user
 * POST /api/auth/google
 * Handles Google Sign-In authentication
 */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user with Google account
      // Use email as username (or first part of email)
      const username = name || email.split('@')[0];
      
      // For Google OAuth users, we don't have a password
      // We'll store a special marker to indicate Google OAuth account
      const googleAuthMarker = `google_oauth_${googleId}`;
      
      user = await User.create(username, email, googleAuthMarker);
      
      console.log(`New user created via Google OAuth: ${email}`);
    } else {
      console.log(`Existing user logged in via Google OAuth: ${email}`);
    }

    // Generate JWT token (same as regular login)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '360000s' } // Same as regular login
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    
    // Handle specific Google OAuth errors
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(401).json({ error: 'Google token expired. Please try again.' });
    }
    
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(401).json({ error: 'Invalid Google token. Please try again.' });
    }

    res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
};

module.exports = {
  googleAuth,
};

