const { MESSANGER_TYPE_KEY } = require("../../constants/messanger.constant");
const FacebookException = require("../../exceptions/FacebookException");
const { readJsonFromFile, writeJsonToFile, addObjectToFile } = require("../../functions/function");
const ChatRepository = require("../../repositories/ChatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const InstagramAccountRepository = require("../../repositories/InstagramAccountRepository");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
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
                await this.processMessage(messageObj);
            })

            changes?.forEach(async (change) => {
                await this.processChanges(change);
            })
        });
    }


    async processMessage(messageObj) {
        try {
            const {
                recipient,
                sender,
                message,
                reaction,
            } = messageObj;

            let instagramProfile;
            let chatId;

           


            if (message && message.is_echo) {
                chatId = createChatId(recipient.id, sender.id);
                instagramProfile = await InstagramAccountRepository.findByInstagramUserId(sender.id);
            }
            else {
                chatId = createChatId(sender.id, recipient.id);
                instagramProfile = await InstagramAccountRepository.findByInstagramUserId(recipient.id);
            }


            const existingChat = await ChatRepository.findChatByChatId(chatId);
            if (!existingChat) {
                await this.createNewChat({ ...messageObj, chatId, ...instagramProfile });
            }


            if (!instagramProfile) {
                throw new FacebookException("Profile not found", "Unknown", 403);
            }

            await this.initIOService(instagramProfile.uid);

            const path = prepareChatPath(instagramProfile.uid, chatId);

            messageObj = {
                ...messageObj,
                ...instagramProfile,
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

            await this.emitUpdateConversationEvent(instagramProfile.uid);
        } catch (error) {
            return false;
        }
    }


    async processChanges(change) {
        try {
            const {
                field,
                value
            } = change;

            if (field === "messaging_seen") {

                const {
                    sender,
                    recipient,
                } = value

                instagramProfile = await InstagramAccountRepository.findByInstagramUserId(recipient.id);

              
                let chatId = createChatId(sender.id, recipient.id);

                if (!instagramProfile) {
                    throw new FacebookException("Profile not found", "Unknown", 403);
                }

                await this.initIOService(instagramProfile.uid);

                const path = prepareChatPath(instagramProfile.uid, chatId);

                change = {
                    ...value,
                    ...instagramProfile,
                    path,
                    chatId
                }

                this.processDeliveryMessage(change);

                await this.emitUpdateConversationEvent(instagramProfile.uid);
            }
        } catch (error) {
            return false;
        }
    }




    async createNewChat(messageObj) {
        const profileService = new InstagramProfileService(null, messageObj.token)
        const { from } = await profileService.fetchProfileByMessage(messageObj.message.mid);
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
