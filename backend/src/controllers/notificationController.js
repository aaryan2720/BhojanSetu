const Notification = require('../models/Notification');

const notificationController = {
  // Create notification and emit socket event
  async createNotification(recipient, type, listing, message, io) {
    try {
      const notification = new Notification({
        recipient,
        type,
        listing,
        message
      });
      await notification.save();

      // Emit to specific user
      io.to(recipient.toString()).emit('notification', notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get user's notifications
  async getUserNotifications(req, res) {
    try {
      const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .populate('listing', 'title');
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      notification.read = true;
      await notification.save();
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = notificationController; 