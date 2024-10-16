# Real-Time Chat Application (Server)

This is the server-side of a real-time chat application with file-sharing capabilities. Built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**, it allows users to join chat rooms, send/receive real-time messages, and share files using Node.js streams and buffers. User authentication, chat history, and file metadata are stored securely in MongoDB.

## Features

- **Real-time Communication**: Users can send and receive messages in real-time using Socket.IO.
- **File Sharing**: Efficient file uploads/downloads with Node.js streams and buffers.
- **User Authentication**: Secure user login and registration using JWT (JSON Web Tokens).
- **Persistent Chat History**: MongoDB stores chat messages, user data, and file metadata for future retrieval.
- **Scalability**: The application is designed for horizontal scaling and optimized for concurrent users.

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
│   └── webRoutes.js
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

To execute tests for authentication and chat functionality, use the following command:

```bash
npm test
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

## Error Handling

The application includes robust error handling for:

- Invalid JWT tokens
- Database connection errors
- File upload/download issues
- User authentication failures

## Future Improvements

- **Private Messaging**: Implement direct messaging between individual users.
- **Group Chats**: Allow for group chat rooms with multiple participants.
- **Notifications**: Add real-time notifications for new messages or file uploads.
- **OAuth Integration**: Implement social logins via Google, Facebook, etc.
- **Admin Dashboard**: Build a dashboard for managing users, chat rooms, and file uploads.

## License

This project is licensed under the [MIT License](LICENSE). 