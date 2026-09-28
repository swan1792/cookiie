const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Protected route — returns dashboard data
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    return res.json({
      message: `Welcome to the admin dashboard, ${req.user.name}!`,
      user: req.user,
      stats: {
        totalUsers: 42,
        activeSessions: 7,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/profile
 * Protected route — returns user profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
