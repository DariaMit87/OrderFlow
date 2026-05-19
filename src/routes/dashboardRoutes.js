const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// After login redirect to the correct dashboard based on the user's role
router.get('/', ensureAuthenticated, dashboardController.getDashboard);

module.exports = router;
