const Event = require('../models/Event');
const User = require('../models/User');
const StorageBooking = require('../models/StorageBooking');

const analyticsController = {
  async getEventAnalytics(req, res) {
    try {
      // Get overview statistics
      const totalEvents = await Event.countDocuments();
      const activeEvents = await Event.countDocuments({
        'schedule.distribution.end': { $gte: new Date() }
      });
      const totalDonors = await User.countDocuments({ userType: 'donor' });
      
      // Calculate food distribution trends
      const foodDistribution = await Event.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            quantity: { $sum: "$totalFoodCollected" }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 30 }
      ]);

      // Calculate donor participation
      const donorParticipation = await Event.aggregate([
        {
          $group: {
            _id: "$donors.user",
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            single: {
              $sum: { $cond: [{ $eq: ["$count", 1] }, 1, 0] }
            },
            regular: {
              $sum: { $cond: [{ $gt: ["$count", 1] }, 1, 0] }
            }
          }
        }
      ]);

      // Calculate storage utilization
      const storageUtilization = await StorageBooking.aggregate([
        {
          $group: {
            _id: "$storageOption.type",
            used: { $sum: "$quantity" },
            total: { $first: "$storageOption.capacity" }
          }
        }
      ]);

      res.json({
        overview: {
          totalEvents,
          activeEvents,
          totalDonors,
          totalFoodCollected: await Event.aggregate([
            { $group: { _id: null, total: { $sum: "$totalFoodCollected" } } }
          ]).then(result => result[0]?.total || 0)
        },
        foodDistribution: foodDistribution.map(item => ({
          date: item._id,
          quantity: item.quantity
        })),
        donorParticipation: [
          { name: 'Single Time', value: donorParticipation[0]?.single || 0 },
          { name: 'Regular', value: donorParticipation[0]?.regular || 0 }
        ],
        storageUtilization: storageUtilization.map(item => ({
          type: item._id,
          utilization: (item.used / item.total) * 100
        }))
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = analyticsController; 