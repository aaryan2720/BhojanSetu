require('dotenv').config();

const config = {
  secret: process.env.JWT_SECRET || 'your_default_jwt_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

module.exports = config; 