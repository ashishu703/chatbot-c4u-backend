const InboxService = require("../services/inboxService");

class InboxController {
  static async handleWebhook(req, res) {
    try {
      const { uid } = req.params;
      const body = req.body;
      await InboxService.handleWebhook(uid, body);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getChats(req, res) {
    try {
      const user = req.decode;
      const chats = await InboxService.getChats(user.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getConversation(req, res) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const conversation = await InboxService.getConversation(user.uid, chatId);
      res.json({ data: conversation, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async verifyWebhook(req, res) {
    try {
      const { uid } = req.params;
      const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
      const result = await InboxService.verifyWebhook(uid, mode, token, challenge);
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

  static async testSocket(req, res) {
    try {
      const { msg } = req.query;
      const result = await InboxService.testSocket();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendTemplate(req, res) {
    try {
      const { content, toName, toNumber, chatId, msgType } = req.body;
      const user = req.decode;
      if (!content || !toName || !toNumber || !msgType) {
        return res.json({ success: false, msg: "Invalid request" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendImage(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendVideo(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendDocument(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendAudio(req, res) {
    try {
      const { url, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendText(req, res) {
    try {
      const { text, toNumber, toName, chatId } = req.body;
      const user = req.decode;
      if (!text || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const result = await InboxService.sendMessage(user.uid, {
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

  static async sendMetaTemplate(req, res) {
    try {
      const { template, toNumber, toName, chatId, example } = req.body;
      const user = req.decode;
      if (!template) {
        return res.json({ success: false, msg: "Please provide template" });
      }
      const result = await InboxService.sendMetaTemplate(user.uid, {
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

  static async deleteChat(req, res) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      const result = await InboxService.deleteChat(user.uid, chatId);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = InboxController;