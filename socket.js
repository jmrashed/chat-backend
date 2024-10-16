const socketIO = require("socket.io");
const ChatMessage = require("./models/ChatMessage"); // Chat message model
const { authenticateSocket } = require("./middleware/authMiddleware"); // JWT authentication middleware for sockets

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*", // Allow all origins (adjust for production)
      methods: ["GET", "POST"],
    },
  });

  // Middleware for authenticating Socket.IO connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const user = await authenticateSocket(token);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.user.username}`);

    // Join chat room
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
      // console.log(`${socket.user.username} joined room: ${room}`);
    });

    // Handle new chat message
    socket.on("chatMessage", async ({ room, message }) => {
      try {
        // Save message to MongoDB
        const newMessage = new ChatMessage({
          username: socket.user.username,
          message,
          room,
          timestamp: Date.now(),
        });
        await newMessage.save();

        // Broadcast message to the room
        io.to(room).emit("message", {
          username: socket.user.username,
          message,
          timestamp: newMessage.timestamp,
        });
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", "Error sending message");
      }
    });

    // Handle file sharing (streams)
    socket.on("fileShare", async ({ room, fileBuffer, fileName }) => {
      try {
        // Broadcast file to the room
        io.to(room).emit("fileReceived", {
          username: socket.user.username,
          fileName,
          fileBuffer,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error sharing file:", error);
        socket.emit("error", "Error sharing file");
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
