const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

// Get the JWT secret key and expiration time from environment variables
const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";
const jwtExpireTime = process.env.JWT_EXPIRE_TIME || "1h";

// Function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpireTime,
  });
};

// Function to verify a JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
};

// Middleware to authenticate the token (can be used in protected routes)
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expected 'Bearer <token>'

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  // Attach user info to request
  req.user = decoded;
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT,
};
