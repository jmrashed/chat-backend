const socketIO = require("socket.io");
const ChatMessage = require("./src/models/Message");
const User = require("./src/models/User");
const { authenticateSocket } = require("./src/middleware/authMiddleware");

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

  // Store typing users
  const typingUsers = new Map();

  io.on("connection", (socket) => {
    // Join chat room
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
      socket.room = room;
    });

    // Handle new chat message
    socket.on("sendMessage", async ({ room, content, replyTo }) => {
      try {
        const mentions = await extractMentions(content);
        
        const newMessage = new ChatMessage({
          content,
          sender: socket.user._id,
          room,
          replyTo,
          mentions,
          status: 'sent'
        });
        await newMessage.save();
        
        await newMessage.populate('sender', 'username');
        
        // Broadcast to room
        io.to(room).emit("receiveMessage", newMessage);
        
        // Handle replies
        if (replyTo) {
          io.to(room).emit("receiveReply", newMessage);
        }
        
        // Notify mentioned users
        mentions.forEach(userId => {
          io.to(userId.toString()).emit("mention", {
            message: newMessage,
            mentionedBy: socket.user.username
          });
        });
        
        // Update message status
        setTimeout(() => {
          newMessage.status = 'delivered';
          newMessage.save();
          io.to(room).emit("messageDelivered", { messageId: newMessage._id });
        }, 1000);
        
      } catch (error) {
        socket.emit("error", "Error sending message");
      }
    });

    // Message reactions
    socket.on("addReaction", async ({ messageId, emoji }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message) {
          message.reactions.push({ userId: socket.user._id, emoji });
          await message.save();
          io.to(socket.room).emit("reactionAdded", { messageId, userId: socket.user._id, emoji });
        }
      } catch (error) {
        socket.emit("error", "Error adding reaction");
      }
    });

    socket.on("removeReaction", async ({ messageId, reactionId }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message) {
          message.reactions.pull(reactionId);
          await message.save();
          io.to(socket.room).emit("reactionRemoved", { messageId, reactionId });
        }
      } catch (error) {
        socket.emit("error", "Error removing reaction");
      }
    });

    // Message editing
    socket.on("editMessage", async ({ messageId, content }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message && message.sender.toString() === socket.user._id.toString()) {
          message.content = content;
          message.editedAt = new Date();
          await message.save();
          io.to(socket.room).emit("messageEdited", { messageId, content, editedAt: message.editedAt });
        }
      } catch (error) {
        socket.emit("error", "Error editing message");
      }
    });

    // Message deletion
    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message && message.sender.toString() === socket.user._id.toString()) {
          message.deletedAt = new Date();
          message.deletedBy = socket.user._id;
          await message.save();
          io.to(socket.room).emit("messageDeleted", { messageId });
        }
      } catch (error) {
        socket.emit("error", "Error deleting message");
      }
    });

    // Message read status
    socket.on("markAsRead", async ({ messageId }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message) {
          const alreadyRead = message.readBy.find(r => r.userId.toString() === socket.user._id.toString());
          if (!alreadyRead) {
            message.readBy.push({ userId: socket.user._id });
            message.status = 'read';
            await message.save();
            io.to(socket.room).emit("messageRead", { messageId, userId: socket.user._id });
          }
        }
      } catch (error) {
        socket.emit("error", "Error marking message as read");
      }
    });

    // Typing indicators
    socket.on("typingStart", ({ room }) => {
      const key = `${room}-${socket.user._id}`;
      if (!typingUsers.has(key)) {
        typingUsers.set(key, { userId: socket.user._id, username: socket.user.username, room });
        socket.to(room).emit("userTyping", { userId: socket.user._id, username: socket.user.username });
        
        // Auto-stop typing after 3 seconds
        setTimeout(() => {
          if (typingUsers.has(key)) {
            typingUsers.delete(key);
            socket.to(room).emit("userStoppedTyping", { userId: socket.user._id });
          }
        }, 3000);
      }
    });

    socket.on("typingStop", ({ room }) => {
      const key = `${room}-${socket.user._id}`;
      if (typingUsers.has(key)) {
        typingUsers.delete(key);
        socket.to(room).emit("userStoppedTyping", { userId: socket.user._id });
      }
    });

    // Message pinning
    socket.on("pinMessage", async ({ messageId }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (message) {
          message.pinned = !message.pinned;
          message.pinnedBy = message.pinned ? socket.user._id : undefined;
          message.pinnedAt = message.pinned ? new Date() : undefined;
          await message.save();
          io.to(socket.room).emit(message.pinned ? "messagePinned" : "messageUnpinned", { messageId });
        }
      } catch (error) {
        socket.emit("error", "Error pinning message");
      }
    });

    // File sharing
    socket.on("fileShare", async ({ room, fileBuffer, fileName }) => {
      try {
        io.to(room).emit("fileReceived", {
          username: socket.user.username,
          fileName,
          fileBuffer,
          timestamp: Date.now(),
        });
      } catch (error) {
        socket.emit("error", "Error sharing file");
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Clean up typing indicators
      for (const [key, value] of typingUsers.entries()) {
        if (value.userId.toString() === socket.user._id.toString()) {
          typingUsers.delete(key);
          socket.to(value.room).emit("userStoppedTyping", { userId: socket.user._id });
        }
      }
    });
  });

  // Helper function to extract mentions
  const extractMentions = async (content) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const user = await User.findOne({ username: match[1] });
      if (user) mentions.push(user._id);
    }
    
    return mentions;
  };

  return io;
};

module.exports = initializeSocket;
