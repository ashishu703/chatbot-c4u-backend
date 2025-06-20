
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { initializeSocket } = require('./socket.js');
const { runBroadcastJob } = require('./jobs/broadcast.job')

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())
app.use(fileUpload())

// routers 
const userRoute = require('./routes/user.routes.js')
app.use('/api/user', userRoute)

const webRoute = require('./routes/web.routes.js')
app.use('/api/web', webRoute)

const adminRoute = require('./routes/admin.routes.js')
app.use('/api/admin', adminRoute)

const phonebookRoute = require('./routes/phonebook.routes.js')
app.use('/api/phonebook', phonebookRoute)

const chat_flowRoute = require('./routes/chat-flow.routes.js')
app.use('/api/chat_flow', chat_flowRoute)

const inboxRoute = require('./routes/inbox.routes.js')
app.use('/api/inbox', inboxRoute)

const templetRoute = require('./routes/templet.routes.js')
app.use('/api/templet', templetRoute)

const chatbotRoute = require('./routes/chatbot.routes.js')
app.use('/api/chatbot', chatbotRoute)

const broadcastRoute = require('./routes/broadcast.routes.js')
app.use('/api/broadcast', broadcastRoute)

const apiRoute = require('./routes/apiv2.routes.js')
app.use('/api/v1', apiRoute)

const agentRoute = require('./routes/agent.routes.js')
app.use('/api/agent', agentRoute)


app.use('/api/messanger', require('./routes/messanger.routes.js'))

app.use('/api/instagram', require('./routes/instagram.routes.js'))

app.use('/api/whatsapp', require('./routes/whatsapp.routes.js'))

app.use('/api/quick-replies', require('./routes/quick-replies.routes.js'))



const path = require("path");
const { port } = require('./config/app.config.js')

const currentDir = process.cwd();

app.use(express.static(path.resolve(currentDir, "./client/public")));

app.get("*", function (request, response) {
    response.sendFile(path.resolve(currentDir, "./client", "index.html"));
});

const server = app.listen(port || 3010, () => {
    console.log(`WaCrm server is running on port ${port}`);
    setTimeout(() => {
        runBroadcastJob()
    }, 1000);
});

// Initialize Socket.IO and export it
const io = initializeSocket(server);

module.exports = io;
