const jwt = require('jsonwebtoken');

const signToken = (userId, expiresIn = '30m') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ id: String(userId) }, secret, { expiresIn });
};

module.exports = { signToken };
