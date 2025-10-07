require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { getConfig } = require('./config/environment');
const connectDB = require('./config/database');
const { initializeSocket } = require('./config/socket'); // Uncomment if using Socket.IO
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes');
const { 
  generalLimiter, 
  authLimiter, 
  messageLimiter, 
  fileUploadLimiter, 
  roomCreationLimiter 
} = require('./middleware/rateLimiter');
const fs = require('fs');
const { swaggerDocs, swaggerUi } = require('../swagger'); // Adjust the path if needed

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const config = getConfig();
app.use(cors({
  origin: config.cors.origin,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: config.cors.credentials
}));

app.use(express.json());
app.set('trust proxy', true); // Trust the proxy for the X-Forwarded-For header
app.use('/uploads', express.static(path.join(__dirname, '../uploads'),{
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
  },
}));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info('Connected to MongoDB successfully.');

    // Initialize Socket.IO
    initializeSocket(server);

    // Routes with specific rate limiting
    app.use('/api/auth', authLimiter, authRoutes);
    app.use('/api/messages', messageLimiter, chatRoutes);
    app.use('/api/rooms', generalLimiter, chatRoomRoutes);
    
    // Apply general rate limiting to all other routes
    app.use('/api', generalLimiter);

    // Error handling middleware
    app.use(errorHandler);
    app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Start the server only after successful MongoDB connection
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

module.exports = { app, server };
