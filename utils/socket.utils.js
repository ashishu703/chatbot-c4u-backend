const socketIO = require("socket.io");
const RoomRepository = require("../repositories/RoomRepository");
const ChatRepository = require("../repositories/ChatRepository");

let ioInstance;
const roomRepository = new RoomRepository();
const chatRepository = new ChatRepository();

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  ioInstance = io;
  
  console.log('WebSocket server initialized successfully');
  console.log('Socket.IO server is ready to accept connections');


  io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);
    console.log("Total active connections:", io.engine.clientsCount);

    socket.on("user_connected", async ({ userId }) => {
      console.log("User connected with ID:", userId);
      if (userId) {
        try {
          await roomRepository.updateOrCreate({
            uid: userId,
            socket_id: socket.id,
          }, {
            uid: userId
          });
          console.log("User room created/updated for userId:", userId);
          console.log("User socket ID mapped:", socket.id);
        } catch (error) {
          console.error("Error executing database queries:", error);
        }
      }
    });

    socket.on("disconnect", async () => {
      console.log(`A user disconnected with socket ID: ${socket.id}`);
      try {
        await roomRepository.delete({
          socket_id: socket.id
        });
      } catch (error) {
        console.error("Error executing database query:", error);
      }
    });

    socket.on("change_ticket_status", async ({ uid, status, chatId }) => {
      try {
        const ChatIOService = require("../services/ChatIOService");
        await chatRepository.updateStatus(chatId, status);
        const chat = await chatRepository.findByChatId(chatId);
        const ioService = (new ChatIOService()).setChat(chat);
        await ioService.setIO(io).initChat();
        ioService.emitUpdateConversationStatusEvent();
      } catch (error) {
        console.error("Error executing database queries:", error);
      }
    });
  });

  return io;
}

function getIOInstance() {
  return ioInstance;
}

function broadcastToAll(event, data) {
  if (ioInstance) {
    console.log(`Broadcasting ${event} to all users:`, data?.id || 'no id');
    ioInstance.emit(event, data);
    return true;
  }
  console.log('No Socket.IO instance available for broadcasting');
  return false;
}

module.exports = { initializeSocket, getIOInstance, broadcastToAll };
