const PageRepository = require("../repositories/pageRepository");
const FileService = require("../services/fileService");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
class PageController {
  fileService;
  constructor() {
    this.fileService = new FileService();
  }

  async addPage(req, res, next) {
    try {
      const { title, content, slug } = req.body;
      const file = req.files?.file;

      if (!file) {
        throw new NoFilesWereUploadedException();
      }

      const filename = await this.fileService.uploadFile(file);
      await PageRepository.addPage({ title, content, slug, image: filename });

      res.json({ success: true, msg: "Page was added" });
    } catch (err) {
      next(err);
    }
  }

  async getPages(req, res, next) {
    try {
      const pages = await PageRepository.getPages();
      res.json({ data: pages, success: true });
    } catch (err) {
      next(err);
    }
  }

  async deletePage(req, res, next) {
    try {
      const { id } = req.body;
      await PageRepository.deletePage(id);
      res.json({ success: true, msg: "Page was deleted" });
    } catch (err) {
      next(err);
    }
  }

  async getPageBySlug(req, res, next) {
    try {
      const { slug } = req.body;
      const page = await PageRepository.getPageBySlug(slug);
      res.json({ data: page || {}, success: true, page: !!page });
    } catch (err) {
      next(err);
    }
  }

  async updateTerms(req, res, next) {
    try {
      const { title, content } = req.body;
      await PageRepository.updateTerms(title, content);
      res.json({ success: true, msg: "Page updated" });
    } catch (err) {
      next(err);
    }
  }

  async updatePrivacyPolicy(req, res, next) {
    try {
      const { title, content } = req.body;
      await PageRepository.updatePrivacyPolicy(title, content);
      res.json({ success: true, msg: "Page updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PageController;
