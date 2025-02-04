
const { INSTAGRAM_TYPE_KEY } = require("../../constants/instagram.constant");
const ChatRepository = require("../../repositories/ChatRepository");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
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

        const smiUserToken  = await SmiUserTokenRepository.findByUserId(chat.uid, INSTAGRAM_TYPE_KEY);
        
        const chatService = new InstagramChatService(null, smiUserToken.token);

        await chatService.send({
            text,
            toNumber
        })

        res.status(200).json({ msg: "success" });

    }

}