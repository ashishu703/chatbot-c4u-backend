const path = require("path");
const MetaApiRepository = require("../repositories/metaApiRepository");
const UserRepository = require("../repositories/userRepository");
const ChatsRepository = require("../repositories/chatRepository");
const ContactRepository = require("../repositories/contactRepository");
const RoomsRepository = require("../repositories/RoomRepository");
const {
  saveWebhookConversation,
  mergeArrays,
  readJSONFile,
  sendMetaMsg,
  sendMetatemplet,
  updateMetaTempletInMsg,
  getUserPlanDays,
  deleteFileIfExists,
} = require("../functions/function");
const { getIOInstance } = require("../socket");

class InboxService {
  metaApiRepository;
  userRepository;
  chatsRepository;
  contactRepository;
  roomsRepository;
  constructor() {
    this.metaApiRepository = new MetaApiRepository();
    this.userRepository = new UserRepository();
    this.chatsRepository = new ChatsRepository();
    this.contactRepository = new ContactRepository();
    this.roomsRepository = new RoomsRepository();
  }
   async handleWebhook(uid, body) {
    try {
      console.log('Handling Webhook - UID:', uid);
      console.log('Webhook Body:', JSON.stringify(body, null, 2));
      const days = await getUserPlanDays(uid);
      if (days < 1) {
        throw new Error("User plan expired");
      }

      if (body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id) {
        const metaApi = await this.metaApiRepository.findByUid(uid);
        if (metaApi) {
          const checkNumber = body.entry[0].changes[0].value.metadata.phone_number_id;
          if (checkNumber !== metaApi.business_phone_number_id) {
            throw new Error("Phone number ID mismatch");
          }
        }
      }

      await saveWebhookConversation(body, uid);
    } catch (err) {
      console.error('Error in handleWebhook:', err);
      throw new Error(`Webhook processing failed: ${err.message}`);
    }
  }

   async getChats(uid) {
    try {
      const chats = await this.chatsRepository.findByUid(uid);
      const contacts = await this.contactRepository.findByUid(uid);
      return contacts.length ? mergeArrays(contacts, chats) : chats;
    } catch (err) {
      console.error('Error in getChats:', err);
      throw new Error('Failed to fetch chats');
    }
  }

   async getConversation(uid, chatId) {
    try {
      const filePath = path.join(__dirname, `../conversations/inbox/${uid}/${chatId}.json`);
      return await readJSONFile(filePath, 100);
    } catch (err) {
      console.error('Error reading conversation file:', err);
      throw new Error('Failed to read conversation');
    }
  }

   async verifyWebhook(uid, mode, token, challenge) {
    try {
      const user = await this.userRepository.findById(uid);
      if (!user) {
        return { success: false, msg: "Token not verified", webhook: uid, token: "NOT FOUND" };
      }

      if (mode === "subscribe" && token === uid) {
        return { success: true, challenge };
      }
      return { success: false, msg: "Token not verified", webhook: uid, token: "FOUND" };
    } catch (err) {
      console.error('Error in verifyWebhook:', err);
      throw new Error('Failed to verify webhook');
    }
  }

   async testSocket() {
    try {
      const uid = "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8";
      const room = await this.roomsRepository.findByUid(uid);
      if (!room) {
        throw new Error("Room not found");
      }
      const io = getIOInstance();
      io.to(room.socket_id).emit("update_conversations", "msg");
      return { success: true, msg: "Socket event emitted" };
    } catch (err) {
      console.error('Error in testSocket:', err);
      throw new Error('Failed to test socket');
    }
  }

   async sendMessage(uid, { content, toName, toNumber, chatId, msgType, type, url, caption, text }) {
    try {
      let msgObj, savObj;

      switch (type) {
        case "template":
          if (!content || !msgType) {
            throw new Error("Invalid template data");
          }
          msgObj = content;
          savObj = {
            type: msgType,
            metaChatId: "",
            msgContext: content,
            reaction: "",
            timestamp: "",
            senderName: toName,
            senderMobile: toNumber,
            status: "sent",
            star: false,
            route: "OUTGOING",
          };
          break;
        case "image":
        case "video":
        case "document":
          msgObj = { type, [type]: { link: url, caption: caption || "" } };
          savObj = {
            type,
            metaChatId: "",
            msgContext: { type, [type]: { link: url, caption: caption || "" } },
            reaction: "",
            timestamp: "",
            senderName: toName,
            senderMobile: toNumber,
            status: "sent",
            star: false,
            route: "OUTGOING",
          };
          break;
        case "audio":
          msgObj = { type, audio: { link: url } };
          savObj = {
            type,
            metaChatId: "",
            msgContext: { type, audio: { link: url } },
            reaction: "",
            timestamp: "",
            senderName: toName,
            senderMobile: toNumber,
            status: "sent",
            star: false,
            route: "OUTGOING",
          };
          break;
        case "text":
          msgObj = { type, text: { preview_url: true, body: text } };
          savObj = {
            type,
            metaChatId: "",
            msgContext: { type, text: { preview_url: true, body: text } },
            reaction: "",
            timestamp: "",
            senderName: toName,
            senderMobile: toNumber,
            status: "sent",
            star: false,
            route: "OUTGOING",
          };
          break;
        default:
          throw new Error("Invalid message type");
      }

      return await sendMetaMsg(uid, msgObj, toNumber, savObj, chatId);
    } catch (err) {
      console.error('Error in sendMessage:', err);
      throw new Error('Failed to send message');
    }
  }

   async sendMetaTemplate(uid, { template, toNumber, toName, chatId, example }) {
    try {
      const metaApi = await this.metaApiRepository.findByUid(uid);
      if (!metaApi) {
        throw new Error("Please check your Meta API keys");
      }

      const resp = await sendMetatemplet(
        toNumber,
        metaApi.business_phone_number_id,
        metaApi.access_token,
        template,
        example
      );

      if (resp.error) {
        throw new Error(resp.error?.error_user_title || "Please check your API");
      }

      const savObj = {
        type: "text",
        metaChatId: "",
        msgContext: {
          type: "text",
          text: { preview_url: true, body: `{{TEMPLET_MESSAGE}} | ${template?.name}` },
        },
        reaction: "",
        timestamp: "",
        senderName: toName,
        senderMobile: toNumber,
        status: "sent",
        star: false,
        route: "OUTGOING",
      };

      await updateMetaTempletInMsg(uid, savObj, chatId, resp.data?.messages?.[0]?.id);
      return { success: true, msg: "The template message was sent" };
    } catch (err) {
      console.error('Error in sendMetaTemplate:', err);
      throw new Error('Failed to send meta template');
    }
  }

   async deleteChat(uid, chatId) {
    try {
      await ChatsRepository.delete(uid, chatId);
      const filePath = path.join(__dirname, `../conversations/inbox/${uid}/${chatId}.json`);
      await deleteFileIfExists(filePath); // Added await
      return { success: true, msg: "Conversation has been deleted" };
    } catch (err) {
      console.error('Error in deleteChat:', err);
      throw new Error('Failed to delete chat');
    }
  }
}

module.exports = InboxService;