const MetaService = require("../services/metaService");

class ApiController {
  static async sendMessage(req, res) {
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

      const result = await MetaService.sendMessage(token, messageObject);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendTemplate(req, res) {
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

      const result = await MetaService.sendTemplate({
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

module.exports = ApiController;