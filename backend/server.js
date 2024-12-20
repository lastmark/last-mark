const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const Message = require('./models/Message');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const connectedUsers = new Map();

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error("Authentication error: No token provided");
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('username avatar');
    if (!user) {
      return next(new Error('Authentication error'));
    }
    socket.user = user; 
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return next(new Error('Authentication error'));
  }
});

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id, "User ID:", socket.user._id);

  connectedUsers.set(socket.id, socket.user);

  socket.broadcast.emit("newUser", {
    id: socket.user._id,
    username: socket.user.username,
    avatar: socket.user.avatar,
  });

  const users = Array.from(connectedUsers.values()).map(user => ({
    id: user._id,
    username: user.username,
    avatar: user.avatar,
  }));
  socket.emit("currentUsers", users);

  try {
    const messages = await Message.find()
      .populate("sender", "username avatar _id") 
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username avatar _id' },
      })
      .sort({ timestamp: 1 });
    socket.emit("chatHistory", messages);
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
  }

  socket.on("sendMessage", async (msg, callback) => {
    try {
      const message = new Message({
        sender: socket.user._id, 
        content: msg.content,
        timestamp: new Date(),
        replyTo: msg.replyTo || null,
      });

      await message.save();

      const fullMessage = await Message.findById(message._id)
        .populate("sender", "username avatar _id")
        .populate({
          path: 'replyTo',
          populate: { path: 'sender', select: 'username avatar _id' },
        });

      io.emit("receiveMessage", fullMessage);

      callback({ status: "success", message: fullMessage });
    } catch (error) {
      console.error("Error handling sendMessage:", error);
      callback({ status: "error", error: "Failed to send message." });
    }
  });

  socket.on("editMessage", async (updatedMessage, callback) => {
    try {
      const message = await Message.findById(updatedMessage.id);

      if (!message) {
        return callback({ status: "error", error: "Message not found" });
      }

      if (message.sender.toString() !== socket.user._id.toString()) {
        return callback({ status: "error", error: "You are not authorized to edit this message" });
      }

      message.content = updatedMessage.content;
      await message.save();

      const fullMessage = await Message.findById(message._id)
        .populate("sender", "username avatar _id")
        .populate({
          path: 'replyTo',
          populate: { path: 'sender', select: 'username avatar _id' },
        });

      io.emit("messageEdited", fullMessage);

      callback({ status: "success", message: fullMessage });
    } catch (error) {
      console.error("Error handling editMessage:", error);
      callback({ status: "error", error: "Failed to edit message" });
    }
  });

  socket.on("deleteMessage", async (messageId, callback) => {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return callback({ status: "error", error: "Message not found" });
      }

      if (message.sender.toString() !== socket.user._id.toString()) {
        return callback({ status: "error", error: "You are not authorized to delete this message" });
      }

      await message.deleteOne();

      io.emit("messageDeleted", messageId);

      callback({ status: "success" });
    } catch (error) {
      console.error("Error handling deleteMessage:", error);
      callback({ status: "error", error: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedUsers.delete(socket.id);

    socket.broadcast.emit("userDisconnected", {
      id: socket.user._id,
      username: socket.user.username,
      avatar: socket.user.avatar,
    });
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
