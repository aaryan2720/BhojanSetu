const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  documents: [{
    type: String,  // URLs to uploaded documents
    required: true
  }],
  requestDate: {
    type: Date,
    default: Date.now
  },
  message: String
}, { _id: false });

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
    enum: ['donor', 'ngo', 'seeker', 'eventManager', 'admin'],
    required: true
  },
  organization: {
    type: String,
    required: function() {
      return ['donor', 'ngo', 'eventManager'].includes(this.userType);
    },
    trim: true
  },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipCode: { type: String, required: false },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
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
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_submitted'],
    default: 'not_submitted'
  },
  verificationRequest: verificationRequestSchema,
  verificationNotes: String,
  verifiedAt: Date,
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['registration', 'license', 'other'],
      required: true
    },
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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