const { FACEBOOK_TYPE_KEY } = require("../../constants/facebook.constant");
const FacebookException = require("../../exceptions/FacebookException");
const { readJsonFromFile, writeJsonToFile, addObjectToFile } = require("../../functions/function");
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
const { prepareChatPath, createChatId } = require("../../utils/facebook.utils");
const { convertWebhookToSimpleMessage, convertWebhookToDBChatCreateObject, convertWebhookToDBChatUpdateObject } = require("../../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const FacebookPageService = require("./FacebookPageService");
const FacebookService = require("./FacebookService");


module.exports = class FacebookChatService extends FacebookService {
    pageService;
    ioService;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async initIOService(uid) {
        this.ioService = new ChatIOService(uid);
        await this.ioService.initSocket();
    }

    async processIncomingMessages(payload) {


        const { object, entry } = payload;

        entry.forEach(entryObj => {
            const { messaging } = entryObj

            messaging.forEach(async (messageObj) => {


                const {
                    recipient,
                    sender,
                    message,
                    reaction
                } = messageObj;



                const pageProfile = await FacebookPageRepository.findByPageId(recipient.id);

                if (!pageProfile) {
                    throw new FacebookException("Page not found", "Unknown", 403);
                }

                await this.initIOService(pageProfile.uid);

                const chatId = createChatId(sender.id, recipient.id);

                const path = prepareChatPath(pageProfile.uid, chatId);

                messageObj = {
                    ...messageObj,
                    ...pageProfile,
                    path,
                    chatId
                }

                const existingChat = await ChatRepository.findChatByChatId(chatId);


                if (!existingChat) {
                    await this.createNewChat(messageObj);
                }

                if (message) {
                    this.processTextMessage(messageObj);
                }
                else if (reaction) {
                    this.processReaction(messageObj);
                }

               await this.emitUpdateConversationEvent(pageProfile.uid);
            })
        });
    }




    async createNewChat(messageObj) {
        const sender = messageObj.sender;
        const pageService = new FacebookPageService(null, messageObj.token)
        const person = await pageService.fetchProfile(sender.id);
        await ChatRepository.createIfNotExist(convertWebhookToDBChatCreateObject({
            ...messageObj,
            ...person
        }));
    }


    async processTextMessage(messageObj) {
        const { path, chatId } = messageObj;

        const dbMessageObj = convertWebhookToSimpleMessage(messageObj);

        addObjectToFile(dbMessageObj, path);

        this.emitNewMessageEvent(dbMessageObj);

        await ChatRepository.updateLastMessage(chatId, convertWebhookToDBChatUpdateObject({ ...messageObj, message: dbMessageObj }));
    }

    async processReaction(messageObj) {
        const {
            reaction,
            chatId,
            path
        } = messageObj;

        const chats = readJsonFromFile(path);

        let foundMessage;

        const updatedChat = chats.map((chat) => {
           
            if (chat.message_id === reaction.mid) {
                chat.reaction = reaction.emoji
                foundMessage = chat;
            }

            return chat;
        })

        if (foundMessage) {
            this.emitNewReactionEvent(foundMessage, chatId);
            await ChatRepository.updateLastMessage(chatId, convertWebhookToDBChatUpdateObject({ ...messageObj, message: foundMessage }));
        }

        writeJsonToFile(path, updatedChat, null);
    }

    async emitUpdateConversationEvent(uid) {
        const chats = await ChatRepository.findUidId(uid);
        this.ioService.updateConversation({chats});
    }


    async emitNewReactionEvent(message, chatId) {
        this.ioService.pushNewReaction({
            chatId,
            reaction: message.reaction,
            msgId: message.message_id
        });
    }
    

     async emitNewMessageEvent(message, chatId) {
        this.ioService.pushNewMsg({msg: message, chatId});
    }
}

