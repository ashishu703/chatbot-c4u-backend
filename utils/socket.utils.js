const socketIO = require("socket.io");
const { frontendURI } = require("../config/app.config");
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
  });

  ioInstance = io;


  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("user_connected", async ({ userId }) => {
      console.log({ userId });
      if (userId) {
        try {

          await roomRepository.updateOrCreate({
            uid: userId,
            socket_id: socket.id,
          }, {
            uid: userId
          });


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
        await chatRepository.updateStatus(chatId, status);

        const chats = await chatRepository.findInboxChats(uid);
        const socketRoom = await roomRepository.findByUid(uid);

        if (socketRoom?.socket_id) {
          io.to(socketRoom.socket_id).emit("update_chats", chats);
        } else {
          console.log(`Socket ID not found for user ${uid}`);
        }
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

module.exports = { initializeSocket, getIOInstance };
