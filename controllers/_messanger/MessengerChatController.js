
const ChatRepository = require("../../repositories/chatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerChatService = require("../../services/_messanger/MessangerChatService");
const MessangerController = require("./MessangerController");


module.exports = class MessengerChatController extends MessangerController {

    async send(req, res, next) {
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
           next(err);
        }

    }


    async sendImage(req, res, next) {
        try {
            const {
                chatId,
                toNumber,
                url
            } = req.body;
            const chat = await ChatRepository.findChatByChatId(chatId);
            const { recipient } = chat;
            const pageProfile = await FacebookPageRepository.findByPageId(recipient);
            const chatService = new MessangerChatService(null, pageProfile.token);
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
    async sendVideo(req, res, next) {
        try {
            const {
                chatId,
                toNumber,
                url
            } = req.body;
            const chat = await ChatRepository.findChatByChatId(chatId);
            const { recipient } = chat;
            const pageProfile = await FacebookPageRepository.findByPageId(recipient);
            const chatService = new MessangerChatService(null, pageProfile.token);
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
    async sendDoc(req, res, next) {
        try {
            const {
                chatId,
                toNumber,
                url
            } = req.body;
            const chat = await ChatRepository.findChatByChatId(chatId);
            const { recipient } = chat;
            const pageProfile = await FacebookPageRepository.findByPageId(recipient);
            const chatService = new MessangerChatService(null, pageProfile.token);
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
    async sendAudio(req, res, next) {
        try {
            const {
                chatId,
                toNumber,
                url
            } = req.body;
            const chat = await ChatRepository.findChatByChatId(chatId);
            const { recipient } = chat;
            const pageProfile = await FacebookPageRepository.findByPageId(recipient);
            const chatService = new MessangerChatService(null, pageProfile.token);
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