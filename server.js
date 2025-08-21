require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require("path");
const fileUpload = require('express-fileupload')
const { initializeSocket } = require('./utils/socket.utils');
const { runBroadcastJob } = require('./jobs/broadcast.job')
const { port, defaultAppConfig } = require('./config/app.config.js')
const { errorHandler } = require('./utils/error-handler.utils.js')

const app = express()

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())
app.use(fileUpload())

// routers 
app.use('/api/user', require('./routes/user.routes.js'))
app.use('/api/web', require('./routes/web.routes.js'))
app.use('/api/admin', require('./routes/admin.routes.js'))
app.use('/api/phonebook', require('./routes/phonebook.routes.js'))
app.use('/api/chat_flow', require('./routes/chat-flow.routes.js'))
app.use('/api/inbox', require('./routes/inbox.routes.js'))
app.use('/api/templet', require('./routes/templet.routes.js'))
app.use('/api/chatbot', require('./routes/chatbot.routes.js'))
app.use('/api/broadcast', require('./routes/broadcast.routes.js'))
app.use('/api/v1', require('./routes/apiv2.routes.js'))
app.use('/api/agent', require('./routes/agent.routes.js'))
app.use('/api/messanger', require('./routes/messanger.routes.js'))
app.use('/api/instagram', require('./routes/instagram.routes.js'))
app.use('/api/whatsapp', require('./routes/whatsapp.routes.js'))
app.use('/api/quick-replies', require('./routes/quick-replies.routes.js'))
app.use('/api/ai-integration', require('./routes/ai-integration.routes.js'))
app.use(express.static(path.resolve(process.cwd(), "./client/public")));

app.get("*", function (request, response) {
    response.sendFile(path.resolve(process.cwd(), "./client", "index.html"));
});

app.use(errorHandler);

const server = app.listen(port || 3010, () => {
    const { app_name: appName } = defaultAppConfig
    console.log(`${appName} server is running on port ${port}`);
    setTimeout(() => {
        runBroadcastJob()
    }, 1000);
});

const io = initializeSocket(server);

module.exports = io;
