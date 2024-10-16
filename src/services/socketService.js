const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage"); // Assuming your message model is here

class SocketService {
  constructor(server) {
    this.io = new Server(server);
    this.initialize();
  }

  initialize() {
    this.io.on("connection", (socket) => {
      // console.log("New client connected:", socket.id);

      // Handle joining a room
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        // console.log(`User ${socket.id} joined room ${roomId}`);

        // Send chat history to the user
        this.sendChatHistory(roomId, socket);
      });

      // Handle sending a message
      socket.on("sendMessage", async (data) => {
        const { roomId, message, sender } = data;

        // Save the message to the database
        const newMessage = new ChatMessage({ roomId, message, sender });
        await newMessage.save();

        // Emit the message to the room
        this.io.to(roomId).emit("receiveMessage", newMessage);
      });

      // Handle file upload
      socket.on("sendFile", async (data) => {
        const { roomId, file } = data;

        // Handle the file logic here (you may want to save it to the server or a cloud service)
        const newMessage = new ChatMessage({
          roomId,
          message: "File uploaded",
          file: {
            filename: file.filename,
            path: file.path,
          },
          sender: file.sender, // Assuming sender info is included in file data
        });

        await newMessage.save();
        this.io.to(roomId).emit("receiveFile", newMessage);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        // console.log("Client disconnected:", socket.id);
      });
    });
  }

  async sendChatHistory(roomId, socket) {
    try {
      const messages = await ChatMessage.find({ roomId }).populate(
        "sender",
        "username"
      ); // Populate sender info
      socket.emit("chatHistory", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
    }
  }
}

module.exports = SocketService;
