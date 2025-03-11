const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secret, expiresIn } = require('../config/jwt');

const userController = {
  // Register a new user
  async register(req, res) {
    try {
      console.log('Received registration data:', req.body);

      const { name, email, password, userType, organization, phone, city, state, address } = req.body;

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
      if (!name || !email || !password || !userType || !phone) {
        return res.status(400).json({ 
          message: 'Please provide all required fields',
          missingFields: {
            name: !name,
            email: !email,
            password: !password,
            userType: !userType,
            phone: !phone
          }
        });
      }

      // Validate password
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user with address
      user = new User({
        name,
        email,
        password: hashedPassword,
        userType,
        organization,
        phone,
        address: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          zipCode: address?.zipCode || '',
          coordinates: {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
          }
        },
        verificationStatus: userType === 'ngo' ? 'pending' : 'approved'
      });

      await user.save();

      // Create token
      const payload = {
        user: {
          id: user.id,
          userType: user.userType
        }
      };

      jwt.sign(
        payload,
        secret,
        { expiresIn },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              userType: user.userType,
              address: user.address
            },
            message: 'Registration successful'
          });
        }
      );
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
  },

  async getNotificationPreferences(req, res) {
    try {
      const user = await User.findById(req.user.id).select('notificationPreferences');
      res.json(user.notificationPreferences);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notification preferences' });
    }
  },

  async updateNotificationPreferences(req, res) {
    try {
      const user = await User.findById(req.user.id);
      user.notificationPreferences = req.body;
      await user.save();
      
      // Update socket subscriptions if needed
      const io = req.app.get('io');
      if (io) {
        const socket = io.sockets.sockets.get(req.user.id);
        if (socket) {
          socket.emit('preferences_updated', user.notificationPreferences);
        }
      }

      res.json(user.notificationPreferences);
    } catch (error) {
      res.status(500).json({ message: 'Error updating notification preferences' });
    }
  }
};

module.exports = userController;