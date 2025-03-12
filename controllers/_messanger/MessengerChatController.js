
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerChatService = require("../../services/_messanger/MessangerChatService");
const MessangerController = require("./MessangerController");


module.exports = class MessengerChatController extends MessangerController {

    async send(req, res) {
        try {
            const {
                text,
                chatId,
                toNumber
            } = req.body;
            const chat = await ChatRepository.findChatByChatId(chatId);
            const { recipient } = chat;
            const pageProfile = await FacebookPageRepository.findByPageId(recipient);
            const chatService = new MessangerChatService(null, pageProfile.token);
            await chatService.initMeta();
            await chatService.send({
                text,
                toNumber
            })
            return res.status(200).json({ msg: "success" });
        } catch (err) {
            return res.status(500).json({ msg: "something went wrong", err });
        }

    }


    async  sendImage(req, res){
        
    }
    async  sendVideo(req, res){
        
    }
    async  sendDoc(req, res){
        
    }
    async  sendAudio(req, res){
        
    }

}