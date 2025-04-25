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
  getUserPlayDays,
  deleteFileIfExists,
} = require("../functions/function");
const { getIOInstance } = require("../socket");

class InboxService {
  static async handleWebhook(uid, body) {
    const days = await getUserPlayDays(uid);
    if (days < 1) {
      throw new Error("User plan expired");
    }

    if (body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id) {
      const metaApi = await MetaApiRepository.findByUid(uid);
      if (metaApi) {
        const checkNumber = body.entry[0].changes[0].value.metadata.phone_number_id;
        if (checkNumber !== metaApi.business_phone_number_id) {
          throw new Error("Phone number ID mismatch");
        }
      }
    }

    await saveWebhookConversation(body, uid);
  }

  static async getChats(uid) {
    const chats = await ChatsRepository.findByUid(uid);
    const contacts = await ContactRepository.findByUid(uid);
    return contacts.length ? mergeArrays(contacts, chats) : chats;
  }

  static async getConversation(uid, chatId) {
    const filePath = path.join(__dirname, `../conversations/inbox/${uid}/${chatId}.json`);
    return readJSONFile(filePath, 100);
  }

  static async verifyWebhook(uid, mode, token, challenge) {
    const user = await UserRepository.findById(uid);
    if (!user) {
      return { success: false, msg: "Token not verified", webhook: uid, token: "NOT FOUND" };
    }

    if (mode === "subscribe" && token === uid) {
      return { success: true, challenge };
    }
    return { success: false, msg: "Token not verified", webhook: uid, token: "FOUND" };
  }

  static async testSocket() {
    const uid = "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8";
    const room = await RoomsRepository.findByUid(uid);
    if (!room) {
      throw new Error("Room not found");
    }
    const io = getIOInstance();
    io.to(room.socket_id).emit("update_conversations", "msg");
    return { success: true, msg: "Socket event emitted" };
  }

  static async sendMessage(uid, { content, toName, toNumber, chatId, msgType, type, url, caption, text }) {
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
  }

  static async sendMetaTemplate(uid, { template, toNumber, toName, chatId, example }) {
    const metaApi = await MetaApiRepository.findByUid(uid);
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
  }

  static async deleteChat(uid, chatId) {
    await ChatsRepository.delete(uid, chatId);
    const filePath = path.join(__dirname, `../conversations/inbox/${uid}/${chatId}.json`);
    deleteFileIfExists(filePath);
    return { success: true, msg: "Conversation has been deleted" };
  }
}

module.exports = InboxService;