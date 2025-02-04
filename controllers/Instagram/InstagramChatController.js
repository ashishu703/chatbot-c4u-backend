
const { INSTAGRAM_TYPE_KEY } = require("../../constants/instagram.constant");
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const InstagramChatService = require("../../services/Instagram/InstagramChatService");
const InstagramController = require("./InstagramController");


module.exports = class InstagramChatController extends InstagramController {

    async send(req, res) {
        try {
            const {
                text,
                chatId,
                toNumber
            } = req.body;
    
            const chat = await ChatRepository.findChatByChatId(chatId);
    
            const smiUserToken  = await FacebookProfileRepository.findByUserId(chat.uid, INSTAGRAM_TYPE_KEY);
            
          
            const chatService = new InstagramChatService(null, smiUserToken.token);
    
            await chatService.send({
                text,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", error });
        }

    }

}