const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

const eventController = {
  // Create new event
  async createEvent(req, res) {
    try {
      const eventData = {
        ...req.body,
        manager: req.user.id
      };

      const event = new Event(eventData);
      await event.save();

      // Notify nearby donors
      const nearbyDonors = await User.find({
        userType: 'donor',
        'address.location': {
          $near: {
            $geometry: event.location.coordinates,
            $maxDistance: 10000 // 10km radius
          }
        }
      });

      const io = req.app.get('io');
      nearbyDonors.forEach(donor => {
        io.to(donor._id.toString()).emit('new_event', {
          event: event._id,
          message: `New event "${event.title}" needs food donations!`
        });
      });

      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get events managed by user
  async getManagerEvents(req, res) {
    try {
      const events = await Event.find({ manager: req.user.id })
        .populate('donors.user', 'name organization')
        .populate('donors.listing', 'title quantity unit');
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update event status
  async updateEventStatus(req, res) {
    try {
      const { eventId } = req.params;
      const { status } = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (event.manager.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      event.status = status;
      await event.save();

      // Notify donors
      const io = req.app.get('io');
      event.donors.forEach(donor => {
        io.to(donor.user.toString()).emit('event_update', {
          event: event._id,
          status,
          message: `Event "${event.title}" status updated to ${status}`
        });
      });

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get event statistics
  async getEventStats(req, res) {
    try {
      const stats = await Event.aggregate([
        { $match: { manager: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = eventController; 