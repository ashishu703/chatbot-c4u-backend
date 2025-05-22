const socketIO = require("socket.io");
const { query } = require("./database/dbpromise");

let ioInstance;

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTENDURI,
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
          await query(`DELETE FROM rooms WHERE uid = $1`, [userId]);
          await query(`INSERT INTO rooms (uid, socket_id) VALUES ($1, $2)`, [
            userId,
            socket.id,
          ]);
        } catch (error) {
          console.error("Error executing database queries:", error);
        }
      }
    });

    socket.on("disconnect", async () => {
      console.log(`A user disconnected with socket ID: ${socket.id}`);
      try {
        await query(`DELETE FROM rooms WHERE socket_id = $1`, [socket.id]);
      } catch (error) {
        console.error("Error executing database query:", error);
      }
    });

    socket.on("change_ticket_status", async ({ uid, status, chatId }) => {
      try {
        await query(
          `UPDATE chats SET chat_status = $1 WHERE chat_id = $2 AND uid = $3`,
          [status, chatId, uid]
        );

        const chats = await query(`SELECT * FROM chats WHERE uid = $1`, [uid]);
        const getId = await query(`SELECT * FROM rooms WHERE uid = $1`, [uid]);

        if (getId[0]?.socket_id) {
          io.to(getId[0].socket_id).emit("update_chats", { chats });
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
