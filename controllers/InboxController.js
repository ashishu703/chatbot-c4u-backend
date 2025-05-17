const InboxService = require("../services/InboxService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const NotEnoughInputProvidedException = require("../exceptions/CustomExceptions/NotEnoughInputProvidedException");
const ProvideTemplateException = require("../exceptions/CustomExceptions/ProvideTemplateException");
const {formSuccess} = require("../utils/response.utils");
const {formRawResponse} = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");

class InboxController {
  inboxService;
  constructor() {
    this.inboxService = new InboxService();
  }
   async handleWebhook(req, res, next) {
    try {
      const { uid } = req.params;
      const body = req.body;
      await this.inboxService.handleWebhook(uid, body);
      return formSuccess({  });
    } catch (err) {
      next(err);
    }
  }

   async getChats(req, res, next) {
    try {
      const user = req.decode;
      const chats = await this.inboxService.getChats(user.uid);
      return formSuccess({ data: chats });
    } catch (err) {
      next(err);
    }
  }

   async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const conversation = await this.inboxService.getConversation(user.uid, chatId);
      return formSuccess({ data: conversation });
    } catch (err) {
      next(err);
    }
  }

   async verifyWebhook(req, res, next) {
    try {
      const { uid } = req.params;
      const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
      const varifiedChallenge = await this.inboxService.verifyWebhook(uid, mode, token, challenge);
      if (varifiedChallenge) {
        return formRawResponse(varifiedChallenge);
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      next(err);
    }
  }

   async testSocket(req, res, next) {
    try {
      const { msg } = req.query;
     await this.inboxService.testSocket();
      return formSuccess({msg:__t("socket_event_emitted")});
    } catch (err) {
      next(err);
    }
  }

   async sendTemplate(req, res, next) {
    try {
      const { content, toName, toNumber, chatId, msgType } = req.body;
      const user = req.decode;
      if (!content || !toName || !toNumber || !msgType) {
        throw new InvalidRequestException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        content,
        toName,
        toNumber,
        chatId,
        msgType,
        type: "template",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendImage(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        url,
        toNumber,
        toName,
        chatId,
        caption,
        type: "image",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendVideo(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        url,
        toNumber,
        toName,
        chatId,
        caption,
        type: "video",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendDocument(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        url,
        toNumber,
        toName,
        chatId,
        caption,
        type: "document",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendAudio(req, res, next) {
    try {
      const { url, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        url,
        toNumber,
        toName,
        chatId,
        type: "audio",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendText(req, res, next) {
    try {
      const { text, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!text || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const result = await this.inboxService.sendMessage(user.uid, {
        text,
        toNumber,
        toName,
        chatId,
        type: "text",
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendMetaTemplate(req, res, next) {
    try {
      const { template, toNumber, toName, chatId, example } = req.body;
      const user = req.decode;
      if (!template) {
        throw new ProvideTemplateException();
      }
      await this.inboxService.sendMetaTemplate(user.uid, {
        template,
        toNumber,
        toName,
        chatId,
        example,
      });
      return formSuccess({msg:__t(template_message_sent)});
    } catch (err) {
      next(err);
    }
  }

   async deleteChat(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
       await this.inboxService.deleteChat(user.uid, chatId);
      return formSuccess({msg:__t("conversation_deleted")});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InboxController;