const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

const requirementController = {
  // Update food requirements
  async updateRequirements(req, res) {
    try {
      const { eventId } = req.params;
      const { requirements } = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      event.foodRequirements = requirements;
      await event.save();

      // Notify potential donors
      const io = req.app.get('io');
      const nearbyDonors = await User.find({
        userType: 'donor',
        'address.location': {
          $near: {
            $geometry: event.location.coordinates,
            $maxDistance: 10000 // 10km radius
          }
        }
      });

      nearbyDonors.forEach(donor => {
        io.to(donor._id.toString()).emit('food_requirement_update', {
          event: event._id,
          title: event.title,
          requirements: requirements
        });
      });

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get requirement fulfillment status
  async getRequirementStatus(req, res) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate('donors.listing', 'quantity unit type');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const status = event.foodRequirements.map(req => {
        const fulfilled = event.donors.reduce((acc, donor) => {
          if (donor.listing.type === req.type) {
            return acc + donor.listing.quantity;
          }
          return acc;
        }, 0);

        return {
          type: req.type,
          required: req.quantity,
          fulfilled,
          remaining: Math.max(0, req.quantity - fulfilled)
        };
      });

      res.json(status);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getEventDonors(req, res) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate('donors.user', 'name')
        .populate('donors.listing', 'type quantity unit expectedDelivery status');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const donors = event.donors.map(donor => ({
        _id: donor.user._id,
        name: donor.user.name,
        foodType: donor.listing.type,
        quantity: donor.listing.quantity,
        unit: donor.listing.unit,
        status: donor.listing.status,
        expectedDelivery: donor.listing.expectedDelivery
      }));

      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async notifyDonors(req, res) {
    try {
      const { eventId } = req.params;
      const { type } = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Find nearby donors
      const nearbyDonors = await User.find({
        userType: 'donor',
        'location.coordinates': {
          $near: {
            $geometry: event.location.coordinates,
            $maxDistance: 10000 // 10km radius
          }
        }
      });

      // Create notifications for each donor
      const notifications = nearbyDonors.map(donor => ({
        recipient: donor._id,
        type: 'requirement_request',
        message: `${event.title} needs ${type}. Can you help?`,
        event: event._id,
        data: { requirementType: type }
      }));

      await Notification.insertMany(notifications);

      // Send real-time notifications
      const io = req.app.get('io');
      if (io) {
        nearbyDonors.forEach(donor => {
          io.to(donor._id.toString()).emit('requirement_request', {
            eventId: event._id,
            eventTitle: event.title,
            requirementType: type
          });
        });
      }

      res.json({ message: 'Notifications sent successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = requirementController; 