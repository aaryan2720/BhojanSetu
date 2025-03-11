const StorageBooking = require('../models/StorageBooking');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const storageController = {
  // Book storage
  async bookStorage(req, res) {
    try {
      const { eventId, storageOptionId, startTime, endTime, quantity } = req.body;

      // Get event and validate storage option
      const event = await Event.findById(eventId);
      const storageOption = event.storageOptions.id(storageOptionId);

      if (!storageOption || !storageOption.available) {
        return res.status(400).json({ message: 'Storage option not available' });
      }

      // Calculate total hours and price
      const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      const totalPrice = hours * storageOption.pricePerHour * quantity;

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100, // Convert to cents
        currency: 'inr',
        metadata: { integration_check: 'accept_a_payment' }
      });

      // Create booking
      const booking = new StorageBooking({
        event: eventId,
        user: req.user.id,
        storageOption: storageOptionId,
        startTime,
        endTime,
        quantity,
        totalPrice,
        paymentId: paymentIntent.id
      });

      await booking.save();

      res.json({
        booking,
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user's storage bookings
  async getUserBookings(req, res) {
    try {
      const bookings = await StorageBooking.find({ user: req.user.id })
        .populate('event', 'title schedule')
        .sort('-createdAt');
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Confirm payment
  async confirmPayment(req, res) {
    try {
      const { bookingId, paymentIntentId } = req.body;

      const booking = await StorageBooking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        booking.paymentStatus = 'paid';
        await booking.save();
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = storageController; 