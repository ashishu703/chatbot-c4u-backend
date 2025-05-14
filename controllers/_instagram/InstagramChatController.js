
const ChatRepository = require("../../repositories/chatRepository");
const InstagramAccountRepository = require("../../repositories/InstagramAccountRepository");
const InstagramChatService = require("../../services/_instagram/InstagramChatService");
const InstagramController = require("./InstagramController");


module.exports = class InstagramChatController extends InstagramController {

    async send(req, res, next) {
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
        } catch (err) {
            next(err);
        }

    }


    async  sendImage(req, res, next) {
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
        } catch (err) {
            next(err);
        }
    }
    async  sendVideo(req, res, next) {
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
        } catch (err) {
           next(err);
        }
    }
    async  sendDoc(req, res, next) {
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
        } catch (err) {
           next(err);
        }
    }
    async  sendAudio(req, res, next) {
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
        } catch (err) {
           next(err);
        }
    }

}