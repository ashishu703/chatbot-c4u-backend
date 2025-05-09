const PageRepository = require("../repositories/pageRepository");
const FileService = require("../services/fileService");

class PageController {
  fileService;
  constructor() {
    this.fileService = new FileService();
  }

  async addPage(req, res) {
    try {
      const { title, content, slug } = req.body;
      const file = req.files?.file;

      if (!file) {
        return res.status(400).json({ success: false, msg: "No file uploaded" });
      }

      const filename = await this.fileService.uploadFile(file);
      await PageRepository.addPage({ title, content, slug, image: filename });

      res.json({ success: true, msg: "Page was added" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async getPages(req, res) {
    try {
      const pages = await PageRepository.getPages();
      res.json({ data: pages, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  async deletePage(req, res) {
    try {
      const { id } = req.body;
      await PageRepository.deletePage(id);
      res.json({ success: true, msg: "Page was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  async getPageBySlug(req, res) {
    try {
      const { slug } = req.body;
      const page = await PageRepository.getPageBySlug(slug);
      res.json({ data: page || {}, success: true, page: !!page });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  async updateTerms(req, res) {
    try {
      const { title, content } = req.body;
      await PageRepository.updateTerms(title, content);
      res.json({ success: true, msg: "Page updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  async updatePrivacyPolicy(req, res) {
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
