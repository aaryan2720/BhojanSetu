const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/:userId/rating', userController.getRating);
router.get('/notification-preferences', auth, userController.getNotificationPreferences);
router.put('/notification-preferences', auth, userController.updateNotificationPreferences);

module.exports = router; 