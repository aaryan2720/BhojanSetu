const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.post('/', auth, ratingController.submitRating);
router.get('/user/:userId', auth, ratingController.getUserRatings);

module.exports = router; 