const { FACEBOOK_TYPE_KEY } = require("../../constants/messanger.constant");
const FacebookException = require("../../exceptions/FacebookException");
const { readJsonFromFile, writeJsonToFile, addObjectToFile } = require("../../functions/function");
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
const { prepareChatPath, createChatId } = require("../../utils/facebook.utils");
const { convertWebhookReciveMessageToJsonObj, convertInstagramWebhookToDBChatCreateObject, convertWebhookToDBChatUpdateObject, convertWebhookRecieptToJsonObj } = require("../../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const InstagramProfileService = require("./InstagramProfileService");
const MessangerService = require("./InstagramService");


module.exports = class InstagramChatService extends MessangerService {
    ioService;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async initIOService(uid) {
        this.ioService = new ChatIOService(uid);
        await this.ioService.initSocket();
    }

    async processIncomingMessages(payload) {
        const { entry } = payload;

        entry.forEach(entryObj => {
            const { messaging, changes } = entryObj
            messaging?.forEach(async (messageObj) => {
                const {
                    recipient,
                    sender,
                    message,
                    reaction,
                } = messageObj;

                let pageProfile = {//dummy profile
                    uid: "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8",
                    token: "IGAANJYZAG6nXdBZAE9saG5NTzNSUjFiaHRlRVVhSFJsYzg4ZADRpRi04WDh4OXBXamhUenRibGwySEVlQlZApX2VBUUt1ZAzF1NDhmZAWZAxTlA5TGd3M2dZAbU9RbkdQcm11VmpjVGdtcHp4blNTbWlwaGxIZAzI4YlU0RnFUNzV6d3puZAwZDZD"
                };

                let chatId;

                if (message && message.is_echo) {
                    chatId = createChatId(recipient.id, sender.id);
                }
                else {
                    chatId = createChatId(sender.id, recipient.id);
                    const existingChat = await ChatRepository.findChatByChatId(chatId);

                    if (!existingChat) {
                        await this.createNewChat({ ...messageObj, ...pageProfile, chatId });
                    }
                }

                if (!pageProfile) {
                    throw new FacebookException("Page not found", "Unknown", 403);
                }

                await this.initIOService(pageProfile.uid);

                const path = prepareChatPath(pageProfile.uid, chatId);

                messageObj = {
                    ...messageObj,
                    ...pageProfile,
                    path,
                    chatId
                }

                if (message && message.is_echo) {
                    this.processSentReciept(messageObj);
                }
                else if (message) {
                    this.processTextMessage(messageObj);
                }
                else if (reaction) {
                    this.processReaction(messageObj);
                }
               

                await this.emitUpdateConversationEvent(pageProfile.uid);
            })


            changes?.forEach(async (change) => {
                const {
                    field,
                    value
                } = change;

                if (field === "messaging_seen") {

                    const {
                        sender,
                        recipient,
                    } = value

                    let pageProfile = {//dummy profile
                        uid: "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8",
                        token: "IGAANJYZAG6nXdBZAE9saG5NTzNSUjFiaHRlRVVhSFJsYzg4ZADRpRi04WDh4OXBXamhUenRibGwySEVlQlZApX2VBUUt1ZAzF1NDhmZAWZAxTlA5TGd3M2dZAbU9RbkdQcm11VmpjVGdtcHp4blNTbWlwaGxIZAzI4YlU0RnFUNzV6d3puZAwZDZD"
                    };

                    let chatId = createChatId(sender.id, recipient.id);

                    if (!pageProfile) {
                        throw new FacebookException("Page not found", "Unknown", 403);
                    }

                    await this.initIOService(pageProfile.uid);

                    const path = prepareChatPath(pageProfile.uid, chatId);

                    change = {
                        ...value,
                        ...pageProfile,
                        path,
                        chatId
                    }

                    this.processDeliveryMessage(change);

                    await this.emitUpdateConversationEvent(pageProfile.uid);
                }

            })
        });
    }




    async createNewChat(messageObj) {
        const profileService = new InstagramProfileService(null, messageObj.token)
        const { from } = await profileService.fetchProfile(messageObj.message.mid);
        await ChatRepository.createIfNotExist(convertInstagramWebhookToDBChatCreateObject({
            ...messageObj,
            username: from.username
        }));
    }


    async processSentReciept(messageObj) {
        const { path, chatId } = messageObj;
        const dbMessageObj = convertWebhookRecieptToJsonObj(messageObj);
        addObjectToFile(dbMessageObj, path);
        this.emitNewMessageEvent(dbMessageObj, chatId);
        await ChatRepository.updateLastMessage(chatId, convertWebhookToDBChatUpdateObject({ ...messageObj, message: dbMessageObj }));
    }

    async processTextMessage(messageObj) {
        const { path, chatId } = messageObj;
        const dbMessageObj = convertWebhookReciveMessageToJsonObj(messageObj);
        addObjectToFile(dbMessageObj, path);
        this.emitNewMessageEvent(dbMessageObj, chatId);
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


    async processDeliveryMessage(messageObj) {

        const { path, chatId, read } = messageObj;
        const chats = readJsonFromFile(path);
        const updatedChat = [];
        for (let index = 0; index < chats.length; index++) {
            const chat = chats[index];
            if (read) {
                chat.status = 'read';
                this.emitMessageDeliveryEvent(chat, chatId);
                if (read.mid == chat.message_id) {
                    break;
                }
            }
            updatedChat.push(chat);
        }

        writeJsonToFile(path, updatedChat, null);
    }

    async emitUpdateConversationEvent(uid) {
        const chats = await ChatRepository.findUidId(uid);
        this.ioService.updateConversation({ chats });
    }


    async send({
        text,
        toNumber
    }) {
        const payload = {
            recipient: { id: toNumber },
            message: { text },
        };
        return this.post('/me/messages', payload, {
            access_token: this.accessToken
        });
    }


    async emitNewReactionEvent(message, chatId) {
        this.ioService.pushNewReaction({
            chatId,
            reaction: message.reaction,
            message_id: message.message_id
        });
    }


    async emitNewMessageEvent(message, chatId) {
        this.ioService.pushNewMsg({ msg: message, chatId });
    }

    async emitMessageDeliveryEvent({ message_id, status }, chatId) {
        this.ioService.pushUpdateDelivery({ message_id, status, chatId });
    }
}
