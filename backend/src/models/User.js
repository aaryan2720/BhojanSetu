const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['donor', 'ngo', 'seeker'],
    required: true
  },
  organization: {
    type: String,
    required: function() {
      return this.userType === 'donor' || this.userType === 'ngo';
    },
    trim: true
  },
  address: {
    street: {
      type: String,
      required: function() {
        return this.userType !== 'seeker';
      },
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
      required: function() {
        return this.userType !== 'seeker';
      },
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
        default: [0, 0]
      }
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  verificationDocument: {
    url: String,
    publicId: String
  },
  isVerified: {
    type: Boolean,
    default: function() {
      return this.userType !== 'ngo';
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create only the geospatial index, remove the email index since it's already created by unique: true
userSchema.index({ 'address.location': '2dsphere' });

// Add method to check if user can access food listings
userSchema.methods.canAccessFood = function() {
  return this.userType === 'seeker' && this.status === 'active';
};

// Add method to check if user can create food listings
userSchema.methods.canCreateListing = function() {
  return (this.userType === 'donor' || (this.userType === 'ngo' && this.isVerified)) && this.status === 'active';
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  if (this.userType === 'seeker') {
    delete obj.verificationDocument;
    delete obj.isVerified;
    delete obj.organization;
  }
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 