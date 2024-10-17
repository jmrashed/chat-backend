const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Real-Time Chat API',
        version: '1.0.0',
        description: `
          ## Overview
          This is a real-time chat application with file-sharing capabilities built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. It allows users to join chat rooms, send and receive messages in real-time, and share files efficiently using Node.js streams and buffers.

          ### Key Features
          - Real-time messaging via WebSockets.
          - File sharing with efficient streaming and buffer management.
          - User authentication and authorization using JWT.
          - Join or create chat rooms dynamically.

          ### Technology Stack:
          - **Backend**: Node.js, Express.js
          - **Real-time Communication**: Socket.IO
          - **Database**: MongoDB
          - **Authentication**: JWT (JSON Web Tokens)

          ### License
          This API is licensed under the [MIT License](https://opensource.org/licenses/MIT).

          ### Contact
          For any issues or inquiries, please reach out to [jmrashed@gmail.com](mailto:jmrashed@gmail.com).
        `,
        contact: {
          name: "Rashed Uz Zaman",
          email: "jmrashed@gmail.com",
          url: "https://rasheduzzaman.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: 'http://localhost:3020',  // Local development server URL
          description: 'Local Development Server',
        },
        {
          url: 'https://chat.rasheduzzaman.com',  // Production server URL
          description: 'Production Server',
        },
      ],
      tags: [
        {
          name: 'Auth',
          description: 'Authentication endpoints (login, register, token management)',
        },
        {
          name: 'Chat',
          description: 'Real-time chat endpoints',
        },
        {
          name: 'File',
          description: 'File upload and management endpoints',
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
