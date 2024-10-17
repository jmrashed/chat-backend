const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Time Chat API',
      version: '1.0.0',
      description: 'API for This is a real-time chat application with file-sharing capabilities built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. It allows users to join chat rooms, send and receive messages in real-time, and share files efficiently using Node.js streams and buffers.',
    },
    servers: [
      {
        url: 'http://localhost:3020', // Ensure the URL matches your app’s URL
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, 'src/routes/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };
