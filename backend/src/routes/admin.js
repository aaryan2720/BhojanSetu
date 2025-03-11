const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.use(auth, isAdmin);

router.get('/verifications/pending', adminController.getPendingVerifications);
router.post('/verifications/process', adminController.processVerification);
router.get('/verifications/stats', adminController.getVerificationStats);
router.get('/ngos', adminController.getAllNGOs);
router.get('/users/stats', adminController.getUserStats);
router.get('/users', adminController.getAllUsers);
router.get('/test', (req, res) => {
  res.json({ message: 'Admin API is working' });
});

module.exports = router; 