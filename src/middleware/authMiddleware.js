const jwt = require("jsonwebtoken");
const {
    sendUnauthorizedResponse,
} = require("../utils/responseFormatter");

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if authenticated, sends error response if not
 */
const authenticateJWT = (req, res, next) => {
  // Extract token from the Authorization header (Bearer <token>)
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return sendUnauthorizedResponse(res, "No token provided.");
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendUnauthorizedResponse(res, "Invalid token.");
    }
    req.user = user; // Attach decoded user info to request
    next();
  });
};

// Exporting the middleware
module.exports = { authenticateJWT };
