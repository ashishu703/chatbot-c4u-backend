const TempletService = require("../services/templetService");

class TempletController {
  static async addTemplate(req, res) {
    try {
      const { title, type, content } = req.body;
      const user = req.decode;
      if (!title || !type || !content) {
        return res.json({ success: false, msg: "Please provide title, type, and content" });
      }
      const result = await TempletService.addTemplate(user.uid, { title, type, content });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getTemplates(req, res) {
    try {
      const user = req.decode;
      const templates = await TempletService.getTemplates(user.uid);
      res.json({ data: templates, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async deleteTemplates(req, res) {
    try {
      const { selected } = req.body;
      const result = await TempletService.deleteTemplates(selected);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = TempletController;