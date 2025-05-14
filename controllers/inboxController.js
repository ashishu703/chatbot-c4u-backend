const InboxService = require("../services/inboxService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const NotEnoughInputProvidedException = require("../exceptions/CustomExceptions/NotEnoughInputProvidedException");
const ProvideTemplateException = require("../exceptions/CustomExceptions/ProvideTemplateException");


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
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }

   async getChats(req, res, next) {
    try {
      const user = req.decode;
      const chats = await this.inboxService.getChats(user.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      next(err);
    }
  }

   async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const conversation = await this.inboxService.getConversation(user.uid, chatId);
      res.json({ data: conversation, success: true });
    } catch (err) {
      next(err);
    }
  }

   async verifyWebhook(req, res, next) {
    try {
      const { uid } = req.params;
      const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
      const result = await this.inboxService.verifyWebhook(uid, mode, token, challenge);
      if (result.challenge) {
        res.status(200).send(result.challenge);
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
      const result = await this.inboxService.testSocket();
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      const result = await this.inboxService.sendMetaTemplate(user.uid, {
        template,
        toNumber,
        toName,
        chatId,
        example,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

   async deleteChat(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const result = await this.inboxService.deleteChat(user.uid, chatId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InboxController;