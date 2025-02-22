const Rating = require('../models/Rating');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');

const ratingController = {
  // Submit a rating
  async submitRating(req, res) {
    try {
      const { listingId, rating, feedback } = req.body;
      const userId = req.user.id;

      const listing = await FoodListing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      let ratingDoc = await Rating.findOne({ listing: listingId });
      if (!ratingDoc) {
        ratingDoc = new Rating({
          listing: listingId,
          donor: listing.donor,
          ngo: listing.reservedBy
        });
      }

      const userType = req.user.userType;
      if (userType === 'donor') {
        ratingDoc.donorRating = {
          rating,
          feedback,
          createdAt: Date.now()
        };
      } else {
        ratingDoc.ngoRating = {
          rating,
          feedback,
          createdAt: Date.now()
        };
      }

      await ratingDoc.save();

      // Update user's average rating
      const targetUserId = userType === 'donor' ? listing.reservedBy : listing.donor;
      await updateUserRating(targetUserId);

      res.json(ratingDoc);
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get ratings for a user
  async getUserRatings(req, res) {
    try {
      const userId = req.params.userId;
      const ratings = await Rating.find({
        $or: [{ donor: userId }, { ngo: userId }]
      })
        .populate('listing', 'title')
        .populate('donor', 'name organization')
        .populate('ngo', 'name organization');

      res.json(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Helper function to update user's average rating
async function updateUserRating(userId) {
  try {
    const user = await User.findById(userId);
    const ratings = await Rating.find({
      $or: [
        { donor: userId, 'ngoRating.rating': { $exists: true } },
        { ngo: userId, 'donorRating.rating': { $exists: true } }
      ]
    });

    const allRatings = ratings.map(r => 
      user.userType === 'donor' ? r.ngoRating?.rating : r.donorRating?.rating
    ).filter(Boolean);

    if (allRatings.length > 0) {
      const averageRating = allRatings.reduce((a, b) => a + b) / allRatings.length;
      user.rating = averageRating;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}

module.exports = ratingController; 