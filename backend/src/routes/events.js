const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const requirementController = require('../controllers/requirementController');
const auth = require('../middleware/auth');
const isEventManager = require('../middleware/isEventManager');

router.use(auth);

// Event manager routes
router.post('/', isEventManager, eventController.createEvent);
router.get('/manager', isEventManager, eventController.getManagerEvents);
router.get('/stats', isEventManager, eventController.getEventStats);
router.put('/:eventId/status', isEventManager, eventController.updateEventStatus);

// New routes for food requirements
router.put('/:eventId/requirements', isEventManager, requirementController.updateRequirements);
router.get('/:eventId/requirements/status', isEventManager, requirementController.getRequirementStatus);
router.get('/:eventId/donors', isEventManager, requirementController.getEventDonors);
router.post('/:eventId/requirements/notify', isEventManager, requirementController.notifyDonors);

module.exports = router; 