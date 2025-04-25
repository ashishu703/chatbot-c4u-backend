const PageRepository = require("../repositories/pageRepository");
const FileService = require("../services/fileService");

class PageController {
  static async addPage(req, res) {
    try {
      const { title, content, slug } = req.body;
      const file = req.files?.file;
      const filename = await FileService.uploadFile(file);
      await PageRepository.addPage({ title, content, slug, filename });
      res.json({ success: true, msg: "Page was added" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getPages(req, res) {
    try {
      const pages = await PageRepository.getPages();
      res.json({ data: pages, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async deletePage(req, res) {
    try {
      const { id } = req.body;
      await PageRepository.deletePage(id);
      res.json({ success: true, msg: "Page was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async getPageBySlug(req, res) {
    try {
      const { slug } = req.body;
      const page = await PageRepository.getPageBySlug(slug);
      res.json({ data: page || {}, success: true, page: !!page });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static async updateTerms(req, res) {
    try {
      const { title, content } = req.body;
      await PageRepository.updateTerms(title, content);
      res.json({ success: true, msg: "Page updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static async updatePrivacyPolicy(req, res) {
    try {
      const { title, content } = req.body;
      await PageRepository.updatePrivacyPolicy(title, content);
      res.json({ success: true, msg: "Page updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = PageController;