const jwt = require("jsonwebtoken");
const {
    sendUnauthorizedResponse,
} = require("../utils/responseFormatter"); // Ensure you have appropriate response formatter functions

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if token is provided
  if (!token) {
    return sendUnauthorizedResponse(res, "No token provided."); // Use response formatter
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendUnauthorizedResponse(res, "Invalid token."); // Use response formatter
    }
    req.user = user; // Attach user information to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

// Exporting the middleware
module.exports = { authenticateJWT };
