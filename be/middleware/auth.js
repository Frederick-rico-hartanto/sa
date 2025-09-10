const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * A combined middleware for authentication and role-based authorization.
 *
 * This function checks for a valid JWT. If a 'requiredRole' is provided,
 * it also checks if the authenticated user has that role.
 *
 * @param {string} [requiredRole] - The role required to access the route (e.g., 'admin'). If omitted, only a valid login is required.
 * @returns {function} An Express middleware function.
 */
const protect = (requiredRole) => async (req, res, next) => {
  let token;

  // 1. Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user from the token and attach to the request object
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found for this token' });
      }

      // 4. (Optional) If a role is required, check if the user has it
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: `Access denied. Requires '${requiredRole}' role.` });
      }

      // 5. If all checks pass, proceed to the next handler
      next();
      
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };