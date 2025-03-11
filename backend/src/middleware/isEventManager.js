const isEventManager = (req, res, next) => {
  if (req.user.userType !== 'eventManager') {
    return res.status(403).json({ message: 'Access denied. Event Manager only.' });
  }
  next();
};

module.exports = isEventManager; 