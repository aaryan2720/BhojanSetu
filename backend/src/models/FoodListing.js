const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'prepared', 'bakery', 'other']
  },
  expiryDate: {
    type: Date,
    required: true
  },
  pickupTimeWindow: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  pickupAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [78.9629, 20.5937] // Default coordinates for India
      }
    }
  },
  image: {
    url: String,
    publicId: String
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'completed', 'expired'],
    default: 'available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Create indexes
foodListingSchema.index({ 'pickupAddress.location': '2dsphere' });
foodListingSchema.index({ status: 1, expiryDate: 1 });
foodListingSchema.index({ donor: 1 });

// Add method to check if listing can be reserved
foodListingSchema.methods.canBeReserved = function() {
  return this.status === 'available' && new Date(this.expiryDate) > new Date();
};

const FoodListing = mongoose.model('FoodListing', foodListingSchema);

module.exports = FoodListing; 