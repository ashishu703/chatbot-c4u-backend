
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const FacebookChatService = require("../../services/Facebook/FacebookChatService");
const FacebookController = require("./FacebookController");


module.exports = class MessengerChatController extends FacebookController {

    async send(req, res) {
        const {
            text,
            chatId,
            toNumber
        } = req.body;

        const chat = await ChatRepository.findChatByChatId(chatId);

        const { recipient } = chat;

        const pageProfile = await FacebookPageRepository.findByPageId(recipient);

        const chatService = new FacebookChatService(null, pageProfile.token);

        await chatService.send({
            text,
            toNumber
        })

        res.status(200).json({ msg: "success" });

    }

}