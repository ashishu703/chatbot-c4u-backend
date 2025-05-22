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
      const { text, toNumber, toName, chatId } = req.body;
      if (!text || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "text",
        content: { preview_url: true, body: text },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(resp);
    } catch (err) {
      next(err);
    }
  }

   async sendAudio(req, res, next) {
    try {
      const { url, toNumber, toName, chatId } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "audio",
        content: { link: url },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(resp);
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
      return formSuccess({ url });
    } catch (err) {
      next(err);
    }
  }

   async sendDocument(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "document",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(resp);
    } catch (err) {
      next(err);
    }
  }

   async sendVideo(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "video",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(resp);
    } catch (err) {
      next(err);
    }
  }

   async sendImage(req, res, next) {
    try {
      const { url, toNumber, toName, chatId, caption } = req.body;
      if (!url || !toNumber || !toName || !chatId) {
        throw new NotEnoughInputProvidedException();
      }
      const resp = await this.chatService.sendMessage({
        ownerUid: req.owner.uid,
        type: "image",
        content: { link: url, caption: caption || "" },
        toNumber,
        toName,
        chatId,
        agentEmail: req.decode.email,
      });
      return formSuccess(resp);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentMessageController;