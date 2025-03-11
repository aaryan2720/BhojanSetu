const FoodListing = require('../models/FoodListing');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const User = require('../models/User');
const notificationController = require('./notificationController');

const listingController = {
  // Create a new listing
  async createListing(req, res) {
    try {
      console.log('Received data:', req.body);

      const pickupAddress = JSON.parse(req.body.pickupAddress);
      
      // Ensure coordinates are numbers
      if (!pickupAddress.location?.coordinates || 
          pickupAddress.location.coordinates.some(coord => coord === null)) {
        pickupAddress.location = {
          type: 'Point',
          coordinates: [78.9629, 20.5937] // Default to India's coordinates
        };
      }

      const listingData = {
        donor: req.user.id,
        title: req.body.title,
        description: req.body.description,
        quantity: req.body.quantity,
        unit: req.body.unit,
        category: req.body.category,
        expiryDate: new Date(req.body.expiryDate),
        pickupTimeWindow: JSON.parse(req.body.pickupTimeWindow),
        pickupAddress: pickupAddress
      };

      // Handle image upload to Cloudinary
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'bhojansetu',
            use_filename: true
          });

          listingData.image = {
            url: result.secure_url,
            publicId: result.public_id
          };

          // Delete the local file after upload
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload error details:', uploadError);
          // Still create the listing without the image if there's an upload error
          console.warn('Proceeding without image due to upload error');
        }
      }

      // Add price information
      listingData.priceType = req.body.priceType;
      if (req.body.priceType === 'discounted') {
        listingData.originalPrice = req.body.originalPrice;
        listingData.discountedPrice = req.body.discountedPrice;
      }

      const listing = new FoodListing(listingData);
      await listing.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('new_listing', {
        listing: await listing.populate('donor', 'name organization')
      });

      res.status(201).json(listing);
    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Get all listings
  async getListings(req, res) {
    try {
      const listings = await FoodListing.find({ status: 'available' })
        .populate('donor', 'name organization')
        .sort('-createdAt');
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get listings by donor
  async getMyListings(req, res) {
    try {
      const listings = await FoodListing.find({ donor: req.user.id })
        .populate('reservedBy', 'name organization')
        .sort('-createdAt');
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Reserve a listing
  async reserveListing(req, res) {
    try {
      const listing = await FoodListing.findById(req.params.id);
      const success = await listing.processReservation(req.user.id);

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('listing_updated', {
        listingId: listing._id,
        status: listing.status,
        reservationQueue: listing.reservationQueue
      });

      res.json({ success, listing });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Complete a listing
  async completeListing(req, res) {
    try {
      const listing = await FoodListing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.status !== 'reserved') {
        return res.status(400).json({ message: 'Listing is not reserved' });
      }

      listing.status = 'completed';
      await listing.save();

      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = listingController; 