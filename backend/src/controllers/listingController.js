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
          console.error('Cloudinary upload error:', uploadError);
          return res.status(500).json({ message: 'Error uploading image' });
        }
      }

      const listing = new FoodListing(listingData);
      await listing.save();

      // Populate donor information before sending response
      await listing.populate('donor', 'name organization');

      res.status(201).json(listing);
    } catch (error) {
      console.warn('Error creating listing:', error);
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
      const listing = await FoodListing.findById(req.params.id)
        .populate('donor', 'name organization email');
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.status !== 'available') {
        return res.status(400).json({ message: 'Listing is not available' });
      }

      // Get seeker information
      const seeker = await User.findById(req.user.id).select('name organization phone');

      listing.status = 'reserved';
      listing.reservedBy = req.user.id;
      listing.reservedAt = new Date();
      await listing.save();

      // Create notification for donor
      const notification = await notificationController.createNotification(
        listing.donor._id,
        'reservation',
        listing._id,
        `${seeker.name} from ${seeker.organization} has reserved your food listing "${listing.title}"`,
        req.app.get('io')
      );

      // Send email notification (if you have email service set up)
      // sendEmail(listing.donor.email, 'Food Listing Reserved', ...);

      // Emit socket event with seeker details
      const io = req.app.get('io');
      io.to(listing.donor._id.toString()).emit('listing_reserved', {
        listingId: listing._id,
        reservedBy: {
          name: seeker.name,
          organization: seeker.organization,
          phone: seeker.phone
        },
        title: listing.title
      });

      res.json({
        ...listing.toObject(),
        reservedBy: seeker
      });
    } catch (error) {
      console.error('Error reserving listing:', error);
      res.status(500).json({ message: 'Server error' });
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