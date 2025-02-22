const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const listingController = require('../controllers/listingController');

router.post('/', auth, upload.single('image'), listingController.createListing);
router.get('/', listingController.getListings);
router.get('/my-listings', auth, listingController.getMyListings);
router.put('/:id/reserve', auth, listingController.reserveListing);
router.put('/:id/complete', auth, listingController.completeListing);

module.exports = router; 