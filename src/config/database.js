// config/db.js
const mongoose = require("mongoose");
const logger = require("../utils/logger");
require("dotenv").config(); // Load environment variables

// Load MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  logger.error("MongoDB URI is not defined. Please set MONGO_URI in the environment.");
  process.exit(1); // Exit if no MongoDB URI is provided
}

// Function to connect to MongoDB
const connectDB = async () => {
  let retries = 5; // Number of retry attempts
  while (retries) {
    try {
      // Establish connection with MongoDB
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      logger.info('MongoDB connected successfully');
      break; // Break out of the retry loop once connected
    } catch (error) {
      logger.error(`MongoDB connection error: ${error.message}`);
      
      retries -= 1;
      logger.info(`Retries left: ${retries}`);
      if (retries === 0) {
        logger.error("Exhausted all retries. Exiting...");
        process.exit(1); // Exit process if all retry attempts fail
      }

      // Wait 5 seconds before trying again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB; // Export the connectDB function
