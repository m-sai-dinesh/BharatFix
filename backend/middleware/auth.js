const { verifyToken } = require('../utils/helpers');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password -otp');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' not authorized` });
  }
  next();
};

const superAdminOnly = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  if (!allowedIPs.includes(ip)) {
    return res.status(403).json({ success: false, message: 'Super admin access restricted to localhost' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin only' });
  }
  next();
};

module.exports = { protect, authorize, superAdminOnly };
