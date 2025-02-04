const { MESSANGER_TYPE_KEY } = require("../../constants/messanger.constant");
const FacebookException = require("../../exceptions/FacebookException");
const { readJsonFromFile, writeJsonToFile, addObjectToFile } = require("../../functions/function");
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const { prepareChatPath, createChatId } = require("../../utils/facebook.utils");
const {
    convertWebhookReciveMessageToJsonObj,
    convertMessangerWebhookToDBChatCreateObject,
    convertWebhookToDBChatUpdateObject,
    convertWebhookRecieptToJsonObj
} = require("../../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const MessangerPageService = require("./MessangerPageService");
const MessangerService = require("./MessangerService");


module.exports = class MessangerChatService extends MessangerService {
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
                    reaction,
                    delivery,
                    read
                } = messageObj;

                let pageProfile;
                let chatId;

                if (message && message.is_echo) {
                    pageProfile = await FacebookPageRepository.findByPageId(sender.id);
                    chatId = createChatId(recipient.id, sender.id);
                }
                else {
                    pageProfile = await FacebookPageRepository.findByPageId(recipient.id);
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
                else if (delivery || read) {
                    this.processDeliveryMessage(messageObj);
                }

                await this.emitUpdateConversationEvent(pageProfile.uid);
            })
        });
    }




    async createNewChat(messageObj) {
        const sender = messageObj.sender;
        const pageService = new MessangerPageService(null, messageObj.token)
        const person = await pageService.fetchProfile(sender.id);
        await ChatRepository.createIfNotExist(convertMessangerWebhookToDBChatCreateObject({
            ...messageObj,
            ...person
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

        const { path, chatId, delivery, read } = messageObj;
        const chats = readJsonFromFile(path);

        const updatedChat = chats.map((chat) => {
            if (delivery && delivery.mids.includes(chat.message_id)) {
                chat.status = 'delivered';
                this.emitMessageDeliveryEvent(chat, chatId);
            }
            else if (read) {
                chat.status = 'read';
                this.emitMessageDeliveryEvent(chat, chatId);
            }
            return chat;
        })
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
            messaging_type: "RESPONSE",
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
