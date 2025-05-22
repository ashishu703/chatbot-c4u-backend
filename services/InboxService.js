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
const UserPlanExpiredException = require("../exceptions/CustomExceptions/UserPlanExpiredException");
const PhoneIdMismatchException = require("../exceptions/CustomExceptions/PhoneIdMismatchException");
const TokenNotVerifiedException = require("../exceptions/CustomExceptions/TokenNotVerifiedException");
const RoomNotFoundException = require("../exceptions/CustomExceptions/RoomNotFoundException");
const InvalidTemplateDataException = require("../exceptions/CustomExceptions/InvalidTemplateDataException");
const InvalidMessageTypeException = require("../exceptions/CustomExceptions/InvalidMessageTypeException");
const CheckMetaApiKeysException = require("../exceptions/CustomExceptions/CheckMetaApiKeysException");
const CheckApiException = require("../exceptions/CustomExceptions/CheckApiException");

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
    const days = await getUserPlanDays(uid);
    if (days < 1) {
      throw new UserPlanExpiredException();
    }

    if (body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id) {
      const metaApi = await this.metaApiRepository.findByUid(uid);
      if (metaApi) {
        const checkNumber =
          body.entry[0].changes[0].value.metadata.phone_number_id;
        if (checkNumber !== metaApi.business_phone_number_id) {
          throw new PhoneIdMismatchException();
        }
      }
    }

    await saveWebhookConversation(body, uid);
  }

  async getChats(uid) {
    const chats = await this.chatsRepository.findByUid(uid);
    const contacts = await this.contactRepository.findByUid(uid);
    return contacts.length ? mergeArrays(contacts, chats) : chats;
  }

  async getConversation(uid, chatId) {
    const filePath = path.join(
      __dirname,
      `../conversations/inbox/${uid}/${chatId}.json`
    );
    return await readJSONFile(filePath, 100);
  }

  async verifyWebhook(uid, mode, token, challenge) {
    const user = await this.userRepository.findById(uid);
    if (!user) {
      throw new TokenNotVerifiedException();
    }

    if (mode === "subscribe" && token === uid) {
      return challenge;
    }
    throw new TokenNotVerifiedException();
  }

  async testSocket() {
    const uid = "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8";
    const room = await this.roomsRepository.findByUid(uid);
    if (!room) {
      throw new RoomNotFoundException();
    }
    const io = getIOInstance();
    io.to(room.socket_id).emit("update_conversations", "msg");
    return true;
  }

  async sendMessage(
    uid,
    { content, toName, toNumber, chatId, msgType, type, url, caption, text }
  ) {
    let msgObj, savObj;

    switch (type) {
      case "template":
        if (!content || !msgType) {
          throw new InvalidTemplateDataException();
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
        throw new InvalidMessageTypeException();
    }

    return await sendMetaMsg(uid, msgObj, toNumber, savObj, chatId);
  }

  async sendMetaTemplate(uid, { template, toNumber, toName, chatId, example }) {
    const metaApi = await this.metaApiRepository.findByUid(uid);
    if (!metaApi) {
      throw new CheckMetaApiKeysException();
    }

    const resp = await sendMetatemplet(
      toNumber,
      metaApi.business_phone_number_id,
      metaApi.access_token,
      template,
      example
    );

    if (resp.error) {
      throw new CheckApiException();
    }

    const savObj = {
      type: "text",
      metaChatId: "",
      msgContext: {
        type: "text",
        text: {
          preview_url: true,
          body: `{{TEMPLET_MESSAGE}} | ${template?.name}`,
        },
      },
      reaction: "",
      timestamp: "",
      senderName: toName,
      senderMobile: toNumber,
      status: "sent",
      star: false,
      route: "OUTGOING",
    };

    await updateMetaTempletInMsg(
      uid,
      savObj,
      chatId,
      resp.data?.messages?.[0]?.id
    );
    return true;
  }

  async deleteChat(uid, chatId) {
    await ChatsRepository.delete(uid, chatId);
    const filePath = path.join(
      __dirname,
      `../conversations/inbox/${uid}/${chatId}.json`
    );
    await deleteFileIfExists(filePath); // Added await
    return true;
  }
}

module.exports = InboxService;
