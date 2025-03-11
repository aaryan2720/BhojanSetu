const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const isEventManager = require('../middleware/isEventManager');

router.get('/events', auth, isEventManager, analyticsController.getEventAnalytics);

module.exports = router; 