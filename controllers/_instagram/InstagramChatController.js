
const ChatRepository = require("../../repositories/chatRepository");
const InstagramAccountRepository = require("../../repositories/InstagramAccountRepository");
const InstagramChatService = require("../../services/_instagram/InstagramChatService");
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
    
            const smiUserToken  = await InstagramAccountRepository.findByUserId(chat.uid);
          
            const chatService = new InstagramChatService(null, smiUserToken.token);

            await chatService.initMeta();
    
            await chatService.send({
                text,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", error });
        }

    }


    async  sendImage(req, res){
        try {
            const {
                url,
                chatId,
                toNumber
            } = req.body;
    
            const chat = await ChatRepository.findChatByChatId(chatId);
    
            const smiUserToken  = await InstagramAccountRepository.findByUserId(chat.uid);
          
            const chatService = new InstagramChatService(null, smiUserToken.token);

            await chatService.initMeta();
    
            await chatService.sendImage({
                url,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "something went wrong", error });
        }
    }
    async  sendVideo(req, res){
        try {
            const {
                url,
                chatId,
                toNumber
            } = req.body;
    
            const chat = await ChatRepository.findChatByChatId(chatId);
    
            const smiUserToken  = await InstagramAccountRepository.findByUserId(chat.uid);
          
            const chatService = new InstagramChatService(null, smiUserToken.token);

            await chatService.initMeta();
    
            await chatService.sendVideo({
                url,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", error });
        }
    }
    async  sendDoc(req, res){
        try {
            const {
                url,
                chatId,
                toNumber
            } = req.body;
    
            const chat = await ChatRepository.findChatByChatId(chatId);
    
            const smiUserToken  = await InstagramAccountRepository.findByUserId(chat.uid);
          
            const chatService = new InstagramChatService(null, smiUserToken.token);

            await chatService.initMeta();
    
            await chatService.sendDoc({
                url,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", error });
        }
    }
    async  sendAudio(req, res){
        try {
            const {
                url,
                chatId,
                toNumber
            } = req.body;
    
            const chat = await ChatRepository.findChatByChatId(chatId);
    
            const smiUserToken  = await InstagramAccountRepository.findByUserId(chat.uid);
          
            const chatService = new InstagramChatService(null, smiUserToken.token);

            await chatService.initMeta();
    
            await chatService.sendAudio({
                url,
                toNumber
            })
    
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", error });
        }
    }

}