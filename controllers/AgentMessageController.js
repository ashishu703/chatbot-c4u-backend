const ChatService = require("../services/chatService");
const FileService = require("../services/fileService");
const NotEnoughInputProvidedException = require("../exceptions/CustomExceptions/NotEnoughInputProvidedException");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const { formSuccess } = require("../utils/response.utils");

class AgentMessageController {
  chatService;
  fileService;
  constructor() {
    this.chatService = new ChatService();
    this.fileService = new FileService();
  }
   async sendText(req, res, next) {
    try {
      const { text, senderId, toName, chatId } = req.body;
      if (!text || !senderId || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "text",
        content: { preview_url: true, body: text },
        senderId,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(res,resp);
    } catch (err) {
      next(err);
    }
  }

   async sendAudio(req, res, next) {
    try {
      const { url, senderId, toName, chatId } = req.body;
      if (!url || !senderId || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "audio",
        content: { link: url },
        senderId,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(res,resp);
    } catch (err) {
      next(err);
    }
  }

   async returnMediaUrl(req, res, next) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new NoFilesWereUploadedException();  
      }
      const file = req.files.file;
      const url = await this.fileService.uploadMedia(file);
      return formSuccess(res,{ url });
    } catch (err) {
      next(err);
    }
  }

   async sendDocument(req, res, next) {
    try {
      const { url, senderId, toName, chatId, caption } = req.body;
      if (!url || !senderId || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "document",
        content: { link: url, caption: caption || "" },
        senderId,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(res,resp);
    } catch (err) {
      next(err);
    }
  }

   async sendVideo(req, res, next) {
    try {
      const { url, senderId, toName, chatId, caption } = req.body;
      if (!url || !senderId || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "video",
        content: { link: url, caption: caption || "" },
        senderId,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(res,resp);
    } catch (err) {
      next(err);
    }
  }

   async sendImage(req, res, next) {
    try {
      const { url, senderId, toName, chatId, caption } = req.body;
      if (!url || !senderId || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "image",
        content: { link: url, caption: caption || "" },
        senderId,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(res,resp);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentMessageController;