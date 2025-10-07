# Real-Time Chat Application (Server)

This is the server-side of a real-time chat application with file-sharing capabilities. Built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**, it allows users to join chat rooms, send/receive real-time messages, and share files using Node.js streams and buffers. User authentication, chat history, and file metadata are stored securely in MongoDB.

## Features

- **Real-time Communication**: Users can send and receive messages in real-time using Socket.IO.
- **File Sharing**: Efficient file uploads/downloads with Node.js streams and buffers.
- **User Authentication**: Secure user login and registration using JWT (JSON Web Tokens).
- **Persistent Chat History**: MongoDB stores chat messages, user data, and file metadata for future retrieval.
- **Scalability**: The application is designed for horizontal scaling and optimized for concurrent users.
- **Comprehensive Testing**: Unit, integration, and performance tests with 80%+ coverage.
- **Input Validation**: Joi-based validation for all endpoints with detailed error messages.
- **Rate Limiting**: Configurable rate limits for different endpoint types.
- **Environment Configuration**: Separate configs for development, production, and testing.
- **Error Handling**: Consistent error responses and proper exception handling.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side logic.
- **Express**: Fast web framework for Node.js.
- **Socket.IO**: Enables real-time, bidirectional communication between server and client.
- **MongoDB**: NoSQL database used for chat storage and user management.
- **JWT**: Secure user authentication using JSON Web Tokens.
- **Streams & Buffers**: Handle large file uploads/downloads without blocking the server.

## Project Structure

```bash
.
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── README.md
├── API.md
├── swagger.js
├── seeder.js
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   ├── jwtConfig.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── chatRoomController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── ChatRoom.js
│   │   ├── File.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoomRoutes.js
│   │   └── chatRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   ├── fileService.js
│   │   ├── messageService.js
│   │   └── socketService.js
│   ├── utils/
│   │   ├── fileUpload.js
│   │   ├── logger.js
│   │   └── responseFormatter.js
│   └── validations/
│       └── auth.js
├── tests/
│   ├── auth.test.js
│   └── chat.test.js
├── uploads/
└── views/
    ├── layouts/
    └── *.ejs
```

## Updated Project Structure

```bash
.
├── .env
├── .env.example
├── .gitignore
├── app.js
├── config
│   ├── db.js
│   └── jwtConfig.js
├── controllers
│   ├── authController.js
│   ├── chatController.js
│   └── chatRoomController.js
├── middleware
│   └── authMiddleware.js
├── models
│   ├── ChatMessage.js
│   ├── ChatRoom.js
│   └── User.js
├── routes
│   ├── authRoutes.js
│   ├── chatRoomRoutes.js
│   ├── chatRoutes.js
│   
├── services
│   └── socketService.js
├── socket.js
├── swagger.js
├── uploads
├── utils
│   ├── logger.js
│   └── responseFormatter.js
├── seeder.js
└── tests
    ├── auth.test.js
    └── chat.test.js
```

## Installation

### Prerequisites

- **Node.js** (version 14 or above)
- **MongoDB** (locally or cloud-hosted)
- **Docker** (optional, for containerized deployment)

### Step-by-Step Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/jmrashed/chat-backend.git
    cd chat-backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file:**

    In the root of the project directory, create a `.env` file with the following content:

    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/realtime-chat-app
    JWT_SECRET=your_secret_key
    ```

4. **Start MongoDB:**

    Make sure MongoDB is running locally or connect to your cloud MongoDB instance.

    ```bash
    mongod
    ```

5. **Run the server:**

    Start the application with:

    ```bash
    npm start
    ```

6. **Access the Application:**

    Open your browser and navigate to `http://localhost:3000`.

## Running Tests

Comprehensive test suite covering unit, integration, and performance tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests (auth, chat rooms, messages, files)
npm run test:integration   # Integration tests (full API flows)
npm run test:performance   # Performance tests (load testing)
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode for development
```

## Docker Setup

To run the server in a Docker container:

1. **Build the Docker image:**

    ```bash
    docker build -t realtime-chat-app-server .
    ```

2. **Run the Docker container:**

    ```bash
    docker run -d -p 3000:3000 realtime-chat-app-server
    ```

3. **Access the Application:**

    Navigate to `http://localhost:3000` to use the chat application.

## API Documentation

For API documentation, you can explore the endpoints through Postman or Swagger:

- **Postman Documentation**: [Postman Collection](your-postman-link)
- **Swagger UI**: Available locally at `/api-docs` after starting the server.

## Scalability and Optimization

- **Horizontal Scaling**: Cluster the app or use multiple instances behind a load balancer.
- **Redis**: Use Redis to handle session management and WebSocket scaling with Socket.IO.
- **Database Indexing**: Ensure MongoDB collections are indexed for optimal query performance.
- **Rate Limiting**: Implement rate limiting to control API usage and prevent server overload.

## Quality Assurance

### Error Handling
Robust error handling throughout the application:
- Invalid JWT tokens and authentication failures
- Database connection and query errors
- File upload/download issues and validation
- Input validation with detailed error messages
- Consistent error response format

### Testing
- **Unit Tests**: Individual component testing (auth, rooms, messages, files)
- **Integration Tests**: Full API workflow testing
- **Performance Tests**: Load testing and concurrent user simulation
- **Coverage**: 80%+ test coverage with detailed reports

### Security
- Rate limiting on all endpoints (configurable per endpoint type)
- Input validation and sanitization
- File type and size restrictions
- Environment-specific CORS configuration
- Secure password hashing with bcrypt

### Code Quality
- JSDoc documentation for all functions
- Consistent error handling patterns
- Environment-specific configurations
- Clean, maintainable code structure

## Future Improvements

- **Private Messaging**: Implement direct messaging between individual users.
- **Group Chats**: Allow for group chat rooms with multiple participants.
- **Notifications**: Add real-time notifications for new messages or file uploads.
- **OAuth Integration**: Implement social logins via Google, Facebook, etc.
- **Admin Dashboard**: Build a dashboard for managing users, chat rooms, and file uploads.

## License

This project is licensed under the [MIT License](LICENSE). 


 ## Screenshots

Here are some screenshots of the project:

### Screenshot 1
![Screenshot 1](docs/1.png)