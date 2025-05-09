const TempletService = require("../services/templetService");

class TempletController {
  templetService;
  constructor() {
    this.templetService = new TempletService();
  }
   async addTemplate(req, res) {
    try {
      const { title, type, content } = req.body;
      const user = req.decode;
      if (!title || !type || !content) {
        return res.json({ success: false, msg: "Please provide title, type, and content" });
      }
      const result = await this.templetService.addTemplate(user.uid, { title, type, content });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getTemplates(req, res) {
    try {
      const user = req.decode;
      const templates = await this.templetService.getTemplates(user.uid);
      res.json({ data: templates, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async deleteTemplates(req, res) {
    try {
      const { selected } = req.body;
      const result = await this.templetService.deleteTemplates(selected);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = TempletController;