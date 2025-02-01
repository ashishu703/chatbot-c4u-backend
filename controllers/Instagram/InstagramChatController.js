
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const InstagramChatService = require("../../services/Instagram/InstagramChatService");
const InstagramController = require("./InstagramController");


module.exports = class InstagramChatController extends InstagramController {

    async send(req, res) {
        const {
            text,
            chatId,
            toNumber
        } = req.body;

        const chat = await ChatRepository.findChatByChatId(chatId);

        const { recipient } = chat;

        const pageProfile = await FacebookPageRepository.findByPageId(recipient);

        const chatService = new InstagramChatService(null, pageProfile.token);

        await chatService.send({
            text,
            toNumber
        })

        res.status(200).json({ msg: "success" });

    }

}