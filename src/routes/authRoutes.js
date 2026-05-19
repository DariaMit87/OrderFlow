const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Public routes for login form and form submission
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', ensureAuthenticated, authController.logout);

module.exports = router;
