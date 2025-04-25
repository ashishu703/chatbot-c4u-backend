const ChatService = require("../services/chatService");
const FileService = require("../services/fileService");

class AgentMessageController {
  static async sendText(req, res) {
    try {
      const { text, toNumber, toName, chatId } = req.body;
      if (!text || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const resp = await ChatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "text",
        content: { preview_url: true, body: text },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      res.json(resp);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendAudio(req, res) {
    try {
      const { url, toNumber, toName, chatId } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const resp = await ChatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "audio",
        content: { link: url },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      res.json(resp);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async returnMediaUrl(req, res) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({ success: false, msg: "No files were uploaded" });
      }
      const file = req.files.file;
      const url = await FileService.uploadMedia(file);
      res.json({ success: true, url });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendDocument(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const resp = await ChatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "document",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      res.json(resp);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendVideo(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const resp = await ChatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "video",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      res.json(resp);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendImage(req, res) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
      const resp = await ChatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "image",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      res.json(resp);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = AgentMessageController;