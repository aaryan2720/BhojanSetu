const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secret, expiresIn } = require('../config/jwt');

const userController = {
  // Register a new user
  async register(req, res) {
    try {
      console.log('Received registration data:', req.body);

      const { name, email, password, userType, phone, city, state } = req.body;

      // Log individual fields
      console.log('Required fields:', {
        name,
        email,
        password,
        userType,
        phone,
        city,
        state
      });

      // Validate required fields
      if (!name || !email || !password || !userType || !phone || !city || !state) {
        // Log which fields are missing
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!userType) missingFields.push('userType');
        if (!phone) missingFields.push('phone');
        if (!city) missingFields.push('city');
        if (!state) missingFields.push('state');

        return res.status(400).json({ 
          message: 'Please provide all required fields',
          missingFields: missingFields,
          received: req.body
        });
      }

      // Validate password
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create basic user data
      const userData = {
        name,
        email,
        password: hashedPassword,
        userType,
        phone,
        address: {
          city: city || '',
          state: state || '',
          street: '',
          zipCode: ''
        }
      };

      // Add additional fields for donors and NGOs
      if (userType === 'donor' || userType === 'ngo') {
        const { organization, street, zipCode } = req.body;
        
        // Validate required fields for donors and NGOs
        if (!organization || !street || !zipCode) {
          return res.status(400).json({ 
            message: 'Organization, street address, and ZIP code are required for donors and NGOs',
            receivedData: { organization, street, zipCode }
          });
        }

        userData.organization = organization;
        userData.address.street = street;
        userData.address.zipCode = zipCode;
      }

      // Create user
      const user = new User(userData);
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, userType: user.userType },
        process.env.JWT_SECRET || secret,
        { expiresIn: '24h' }
      );

      // Return success response
      res.status(201).json({
        token,
        user: user.toJSON(),
        message: 'Registration successful'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error registering user',
        error: error.message 
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Please provide both email and password' 
        });
      }

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, userType: user.userType },
        process.env.JWT_SECRET || secret,
        { expiresIn }
      );

      // Return success response
      res.json({
        token,
        user: user.toJSON(),
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, organization, address, phone } = req.body;
      
      user.name = name || user.name;
      user.organization = organization || user.organization;
      user.address = address || user.address;
      user.phone = phone || user.phone;

      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user's rating
  async getRating(req, res) {
    try {
      const user = await User.findById(req.params.userId).select('rating');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ rating: user.rating });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = userController;