const ngoController = {
  async submitVerificationRequest(req, res) {
    try {
      const { documents, message } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user || user.userType !== 'ngo') {
        return res.status(404).json({ message: 'NGO not found' });
      }

      user.verificationRequest = {
        documents,
        message,
        requestDate: new Date()
      };
      user.verificationStatus = 'pending';
      await user.save();

      // Notify admin about new verification request
      const notification = new Notification({
        recipient: 'admin', // You'll need to handle this appropriately
        type: 'new_verification_request',
        message: `New NGO verification request from ${user.organization}`,
        metadata: { ngoId: user._id }
      });
      await notification.save();

      res.json({ message: 'Verification request submitted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ngoController; 