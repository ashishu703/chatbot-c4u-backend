const InboxService = require("../services/inboxService");

class InboxController {
  inboxService;
  constructor() {
    this.inboxService = new InboxService();
  }
   async handleWebhook(req, res) {
    try {
      const { uid } = req.params;
      const body = req.body;
      await this.inboxService.handleWebhook(uid, body);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getChats(req, res) {
    try {
      const user = req.decode;
      const chats = await this.inboxService.getChats(user.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getConversation(req, res) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const conversation = await this.inboxService.getConversation(user.uid, chatId);
      res.json({ data: conversation, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async verifyWebhook(req, res) {
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async testSocket(req, res) {
    try {
      const { msg } = req.query;
      const result = await this.inboxService.testSocket();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendTemplate(req, res) {
    try {
      const { content, toName, toNumber, chatId, msgType } = req.body;
      const user = req.decode;
      if (!content || !toName || !toNumber || !msgType) {
        return res.json({ success: false, msg: "Invalid request" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendImage(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendVideo(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendDocument(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendAudio(req, res) {
    try {
      const { url, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendText(req, res) {
    try {
      const { text, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!text || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendMetaTemplate(req, res) {
    try {
      const { template, toNumber, toName, chatId, example } = req.body;
      const user = req.decode;
      if (!template) {
        return res.json({ success: false, msg: "Please provide template" });
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
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async deleteChat(req, res) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const result = await this.inboxService.deleteChat(user.uid, chatId);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = InboxController;