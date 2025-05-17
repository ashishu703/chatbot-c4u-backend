require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initializeSocket } = require("./socket.js");
const { runCampaign } = require("./loops/campaignLoop.js");
const errorHandler = require("./utils/errorHandler");
const { sequelize } = require("./models");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

app.use(errorHandler);
sequelize
  .sync({ force: false, logging: false })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// routers
const userRoute = require("./routes/userRoutes.js");
app.use("/api/user", userRoute);

const webRoute = require("./routes/webRoutes.js");
app.use("/api/web", webRoute);

const adminRoute = require("./routes/adminRoutes.js");
app.use("/api/admin", adminRoute);

const phonebookRoute = require("./routes/phonebookRoutes.js");
app.use("/api/phonebook", phonebookRoute);

const chat_flowRoute = require("./routes/chatFlowRoutes.js");
app.use("/api/chat_flow", chat_flowRoute);

const inboxRoute = require("./routes/inboxRoutes.js");
app.use("/api/inbox", inboxRoute);

const templetRoute = require("./routes/templetRoutes.js");
app.use("/api/templet", templetRoute);

const chatbotRoute = require("./routes/chatbotRoutes.js");
app.use("/api/chatbot", chatbotRoute);

const broadcastRoute = require("./routes/broadcastRoutes.js");
app.use("/api/broadcast", broadcastRoute);

const apiRoute = require("./routes/apiv2Routes.js");
app.use("/api/v1", apiRoute);

const agentRoute = require("./routes/agentRoutes.js");
app.use("/api/agent", agentRoute);

app.use("/api/messanger", require("./routes/messanger"));

app.use("/api/instagram", require("./routes/instagram"));

app.use("/api/whatsapp", require("./routes/whatsapp"));

app.use("/api/quick-replies", require("./routes/quickReplies"));

const path = require("path");

const currentDir = process.cwd();

app.use(express.static(path.resolve(currentDir, "./client/public")));

app.get("*", function (request, response) {
  response.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

const server = app.listen(process.env.PORT || 3010, () => {
  console.log(`WaCrm server is running on port ${process.env.PORT}`);
  setTimeout(() => {
    runCampaign();
  }, 1000);
});

// Initialize Socket.IO and export it
const io = initializeSocket(server);

module.exports = io;
