const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cron = require('node-cron');

const reminderService = {
  // Send event reminders
  async sendEventReminders() {
    try {
      const upcomingEvents = await Event.find({
        'schedule.distribution.start': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        }
      }).populate('donors.user');

      for (const event of upcomingEvents) {
        // Notify event manager
        await Notification.create({
          recipient: event.manager,
          type: 'event_reminder',
          message: `Your event "${event.title}" is starting in 24 hours`,
          event: event._id
        });

        // Notify donors
        for (const donor of event.donors) {
          await Notification.create({
            recipient: donor.user._id,
            type: 'event_reminder',
            message: `Event "${event.title}" where you're donating starts in 24 hours`,
            event: event._id
          });
        }

        // Send real-time notifications
        const io = global.io;
        if (io) {
          io.to(event.manager.toString()).emit('event_reminder', {
            event: event._id,
            title: event.title
          });

          event.donors.forEach(donor => {
            io.to(donor.user._id.toString()).emit('event_reminder', {
              event: event._id,
              title: event.title
            });
          });
        }
      }
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  },

  // Initialize reminder cron jobs
  initialize() {
    // Check for upcoming events every hour
    cron.schedule('0 * * * *', this.sendEventReminders);
  }
};

module.exports = reminderService; 