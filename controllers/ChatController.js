const TypeTagException = require("../exceptions/CustomExceptions/TypeTagException");
const ChatService = require("../services/chatService");
const { __t } = require("../utils/locale.utils");
const {formSuccess} = require("../utils/response.utils");
class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async saveNote(req, res, next) {
    try {
      const { chatId, note } = req.body;
      await this.chatService.saveNote(chatId, note);
      return formSuccess(res,{ msg:__t("notes_were_updated"),

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

      await this.chatService.pushTag(chatId, tag);
      return formSuccess(res,{ msg: __t("tag_was_added"),

       });
    } catch (err) {
      next(err);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const { chatId, tag } = req.body;
      await this.chatService.deleteTag(chatId, tag);
      return formSuccess(res,{ msg: __t("tag_was_deleted"),
        
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatController;
