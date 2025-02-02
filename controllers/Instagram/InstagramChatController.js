
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
        
        let pageProfile = {//dummy profile
            uid: "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8",
            token: "IGAANJYZAG6nXdBZAE9saG5NTzNSUjFiaHRlRVVhSFJsYzg4ZADRpRi04WDh4OXBXamhUenRibGwySEVlQlZApX2VBUUt1ZAzF1NDhmZAWZAxTlA5TGd3M2dZAbU9RbkdQcm11VmpjVGdtcHp4blNTbWlwaGxIZAzI4YlU0RnFUNzV6d3puZAwZDZD"
        };
        const chatService = new InstagramChatService(null, pageProfile.token);

        await chatService.send({
            text,
            toNumber
        })

        res.status(200).json({ msg: "success" });

    }

}