
const ChatRepository = require("../../repositories/chatRepository");
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


    async sendImage(req, res) {
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
            console.log(err);
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
    async sendVideo(req, res) {
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
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
    async sendDoc(req, res) {
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
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
    async sendAudio(req, res) {
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
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }

}