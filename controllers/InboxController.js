const InboxService = require("../services/InboxService");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const TypeTagException = require("../exceptions/CustomExceptions/TypeTagException");

class InboxController {
  inboxService;
  constructor() {
    this.inboxService = new InboxService();

  }


  async getChats(req, res, next) {
    try {
      const user = req.decode;
      const query = req.query;
      const chats = await this.inboxService.getChats(user.uid, query);
      return formSuccess(res, chats);
    } catch (err) {
      next(err);
    }
  }

    async getWhatsappChats(req, res, next) {
    try {
      const user = req.decode;
      const query = req.query;
      const chats = await this.inboxService.getWhatsappChats(user.uid, query);
      return formSuccess(res, chats);
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const query = req.query;
      const user = req.decode;
      const conversation = await this.inboxService.getConversation(user.uid, chatId, query);
      return formSuccess(res, conversation);
    } catch (err) {
      next(err);
    }
  }



  async testSocket(req, res, next) {
    try {
      const { msg } = req.query;
      await this.inboxService.testSocket();
      return formSuccess(res, { msg: __t("socket_event_emitted") });
    } catch (err) {
      next(err);
    }
  }


  async deleteChat(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      await this.inboxService.deleteChat(user.uid, chatId);
      return formSuccess(res, { msg: __t("conversation_deleted") });
    } catch (err) {
      next(err);
    }
  }


  async saveNote(req, res, next) {
    try {
      const { chatId, note } = req.body;

      await this.inboxService.saveNote(chatId, note);
      return formSuccess(res, {
        msg: __t("notes_were_updated"),

      });
    } catch (err) {
      next(err);
    }
  }

  async pushTag(req, res, next) {
    try {
      const { chatId, tag } = req.body;

      if (!tag) {
        throw new TypeTagException();
      }

      await this.inboxService.pushTag(chatId, tag);
      return formSuccess(res, {
        msg: __t("tag_was_added"),

      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const { chatId, tag } = req.body;
      await this.inboxService.deleteTag(chatId, tag);
      return formSuccess(res, {
        msg: __t("tag_was_deleted"),

      });
    } catch (err) {
      next(err);
    }
  }


  async getAgentChatsOwner(req, res, next) {
    try {
      const { uid } = req.body;
      const chats = await this.inboxService.getAgentChatsOwner(req.decode.uid, uid);
      return formSuccess(res, { data: chats });
    } catch (err) {
      next(err);
    }
  }

  async getAssignedChatAgent(req, res, next) {
    try {
      const { chatId } = req.body;
      const agent = await this.inboxService.getAssignedChatAgent(req.decode.uid, chatId);

      return formSuccess(res, { data: agent });
    } catch (err) {
      next(err);
    }
  }

  async deleteAssignedChat(req, res, next) {
    try {
      const { uid, chat_id } = req.body;
      await this.inboxService.deleteAssignedChat(req.decode.uid, uid, chat_id);
      return formSuccess(res, {
        msg: __t(
          "chat_removed_from_agent"
        ),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAgentInChat(req, res, next) {
    try {
      const { uid: agentUid, chatId } = req.body;
      await this.inboxService.updateAgentInChat(req.decode.uid, agentUid, chatId);
      return formSuccess(res, {
        msg: __t("updated"),
      });
    } catch (err) {
      next(err);
    }
  }

}

module.exports = InboxController;