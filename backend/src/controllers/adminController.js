const User = require('../models/User');
const Notification = require('../models/Notification');

const adminController = {
  // Get all pending NGO verifications
  async getPendingVerifications(req, res) {
    try {
      const pendingNGOs = await User.find({
        userType: 'ngo',
        verificationStatus: 'pending'
      }).select('-password');
      
      res.json(pendingNGOs);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Process NGO verification
  async processVerification(req, res) {
    try {
      const { userId, status, notes } = req.body;
      
      const ngo = await User.findById(userId);
      if (!ngo) {
        return res.status(404).json({ message: 'NGO not found' });
      }

      ngo.verificationStatus = status;
      ngo.verificationNotes = notes;
      ngo.verifiedAt = status === 'approved' ? new Date() : null;
      await ngo.save();

      // Send notification to NGO
      const notification = new Notification({
        recipient: userId,
        type: 'verification_update',
        message: `Your NGO verification has been ${status}. ${notes ? `Notes: ${notes}` : ''}`,
      });
      await notification.save();

      // Get socket instance
      const io = req.app.get('io');
      if (io) {
        io.to(userId.toString()).emit('verification_update', {
          status,
          message: notification.message
        });
      }

      res.json({ message: 'Verification processed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get verification statistics
  async getVerificationStats(req, res) {
    try {
      const stats = await User.aggregate([
        { $match: { userType: 'ngo' } },
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all NGOs
  async getAllNGOs(req, res) {
    try {
      const ngos = await User.find({ 
        userType: 'ngo' 
      }).select('-password').sort({ createdAt: -1 });
      
      res.json(ngos);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add this new method to get user statistics
  async getUserStats(req, res) {
    try {
      // Get counts for each user type
      const userTypeStats = await User.aggregate([
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            suspended: {
              $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get total users count
      const totalUsers = await User.countDocuments();

      // Format the response
      const stats = {
        total: totalUsers,
        byType: userTypeStats.reduce((acc, curr) => {
          acc[curr._id] = {
            total: curr.count,
            active: curr.active,
            suspended: curr.suspended
          };
          return acc;
        }, {})
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update the getAllUsers method with better logging
  async getAllUsers(req, res) {
    try {
      const { userType } = req.query;
      console.log('Fetching users with type:', userType); // Debug log
      
      const query = userType && userType !== 'all' ? { userType } : {};
      console.log('Query:', query); // Debug log
      
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${users.length} users`); // Debug log
      res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
};

module.exports = adminController; 