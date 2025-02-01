
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerChatService = require("../../services/Messanger/MessangerChatService");
const MessangerController = require("./MessangerController");


module.exports = class MessengerChatController extends MessangerController {

    async send(req, res) {
        const {
            text,
            chatId,
            toNumber
        } = req.body;

        const chat = await ChatRepository.findChatByChatId(chatId);

        const { recipient } = chat;

        const pageProfile = await FacebookPageRepository.findByPageId(recipient);

        const chatService = new MessangerChatService(null, pageProfile.token);

        await chatService.send({
            text,
            toNumber
        })

        res.status(200).json({ msg: "success" });

    }

}