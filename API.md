## API Endpoints

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### 1. User Authentication

**POST /api/auth/signup**
- **Description**: Register a new user
- **Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```
- **Error Responses**:
  - 400: Validation failed or email already exists
  - 500: Internal server error

**POST /api/auth/login**
- **Description**: Log in an existing user
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "john_doe",
    "email": "john@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```
- **Error Responses**:
  - 401: Invalid credentials
  - 400: Validation failed
  - 500: Internal server error

**GET /api/auth/logout**
- **Description**: Log out the current user
- **Headers**: Authorization: Bearer <token>
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "User logged out successfully."
}
```

#### 2. Chat Room Management

**POST /api/rooms**
- **Description**: Create a new chat room
- **Headers**: Authorization: Bearer <token>
- **Request Body**:
```json
{
  "name": "General Discussion",
  "description": "A room for general conversations"
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "General Discussion",
    "description": "A room for general conversations",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**GET /api/rooms**
- **Description**: Retrieve all chat rooms
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "General Discussion",
      "description": "A room for general conversations",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**GET /api/rooms/:roomId**
- **Description**: Get specific room details
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Room details retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "General Discussion",
    "description": "A room for general conversations",
    "messages": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. Chat Messaging

**POST /api/messages**
- **Description**: Send a message to a chat room
- **Headers**: Authorization: Bearer <token>
- **Request Body**:
```json
{
  "roomId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "content": "Hello everyone!"
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "content": "Hello everyone!",
    "sender": "64f8a1b2c3d4e5f6a7b8c9d0",
    "room": "64f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**GET /api/messages/:roomId**
- **Description**: Retrieve messages for a room
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "content": "Hello everyone!",
      "sender": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "username": "john_doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4. File Upload and Sharing

**POST /api/files/upload**
- **Description**: Upload a file
- **Headers**: 
  - Authorization: Bearer <token>
  - Content-Type: multipart/form-data
- **Request Body**: Form data with file field
- **Success Response (201)**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "filename": "document.pdf",
    "originalName": "my-document.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "url": "/uploads/document-1234567890.pdf",
    "uploadedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**GET /api/files/:fileId**
- **Description**: Download a file
- **Success Response**: File download with appropriate headers

**GET /api/files**
- **Description**: List uploaded files
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "filename": "document.pdf",
      "originalName": "my-document.pdf",
      "size": 1024000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 5. Real-Time Communication (WebSocket)

- **Socket.IO Events**:
  - `connect`: Triggered when a user connects to the WebSocket.
  - `disconnect`: Triggered when a user disconnects from the WebSocket.
  - `joinRoom`: Event to join a specific chat room.
  - `leaveRoom`: Event to leave a specific chat room.
  - `message`: Event to send a message in the chat room (handles real-time messaging).
  - `fileUpload`: Event to handle file uploads in real time.

#### 5. Real-Time Communication (WebSocket)

**Connection**
```javascript
const socket = io('http://localhost:3020', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

**Events**:
- `connect`: User connects to WebSocket
- `disconnect`: User disconnects
- `joinRoom`: Join a chat room
  ```javascript
  socket.emit('joinRoom', { roomId: '64f8a1b2c3d4e5f6a7b8c9d1' });
  ```
- `leaveRoom`: Leave a chat room
  ```javascript
  socket.emit('leaveRoom', { roomId: '64f8a1b2c3d4e5f6a7b8c9d1' });
  ```
- `message`: Send/receive real-time messages
  ```javascript
  // Send message
  socket.emit('message', {
    roomId: '64f8a1b2c3d4e5f6a7b8c9d1',
    content: 'Hello!'
  });
  
  // Receive message
  socket.on('message', (data) => {
    console.log('New message:', data);
  });
  ```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **429**: Too many requests (rate limited)
- **500**: Internal server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Common Errors
- **Invalid JWT Token**: 401 Unauthorized
- **Validation Errors**: 400 Bad Request with field-specific errors
- **Rate Limit Exceeded**: 429 Too Many Requests
- **Resource Not Found**: 404 Not Found

## Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per 15 minutes
- **File uploads**: 10 requests per hour

## Pagination
For endpoints returning lists, use query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

Example: `GET /api/messages/roomId?page=2&limit=50&sort=createdAt&order=asc`