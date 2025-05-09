const MetaService = require("../services/metaService");

class ApiV2Controller {
  metaService;
  constructor() { 
    this.metaService = new MetaService();
  }
   async sendMessage(req, res) {
    try {
      const { token } = req.query;
      const { messageObject } = req.body;

      if (!token) {
        return res.json({ success: false, message: "API keys not found" });
      }

      if (!messageObject) {
        return res.json({
          success: false,
          message: "messageObject key is required as body response.",
        });
      }

      const result = await this.metaService.sendMessage(token, messageObject);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async sendTemplate(req, res) {
    try {
      const { sendTo, templetName, exampleArr, token, mediaUri } = req.body;

      if (!token) {
        return res.json({ success: false, message: "API keys not found" });
      }

      if (!sendTo) {
        return res.json({ success: false, message: "Please provide `sendTo` key" });
      }

      if (!templetName) {
        return res.json({ success: false, message: "Please provide `templetName`" });
      }

      if (!exampleArr) {
        return res.json({ success: false, message: "Please provide exampleArr array" });
      }

      const result = await this.metaService.sendTemplate({
        token,
        sendTo,
        templetName,
        exampleArr,
        mediaUri,
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = ApiV2Controller;