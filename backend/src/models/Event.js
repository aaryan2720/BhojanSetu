const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expectedAttendees: {
    type: Number,
    required: true
  },
  foodRequirements: [{
    type: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  cutleryRequirement: {
    type: String,
    enum: ['bring-own', 'provided', 'optional'],
    default: 'bring-own'
  },
  storageOptions: [{
    type: {
      type: String,
      enum: ['refrigerated', 'room-temperature', 'heated'],
      required: true
    },
    pricePerHour: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number, // in liters or kg
      required: true
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  donors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered'],
      default: 'pending'
    }
  }],
  schedule: {
    setup: {
      start: Date,
      end: Date
    },
    distribution: {
      start: Date,
      end: Date
    },
    cleanup: {
      start: Date,
      end: Date
    }
  }
}, {
  timestamps: true
});

eventSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Event', eventSchema); 