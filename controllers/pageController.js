const PageRepository = require("../repositories/pageRepository");
const FileService = require("../services/fileService");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const { formSuccess } = require("../utils/response.utils");
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

      return formSuccess({  msg: "Page was added" });
    } catch (err) {
      next(err);
    }
  }

  async getPages(req, res, next) {
    try {
      const pages = await PageRepository.getPages();
      return formSuccess({ data: pages });
    } catch (err) {
      next(err);
    }
  }

  async deletePage(req, res, next) {
    try {
      const { id } = req.body;
      await PageRepository.deletePage(id);
      return formSuccess({ msg: "Page was deleted" });
    } catch (err) {
      next(err);
    }
  }

  async getPageBySlug(req, res, next) {
    try {
      const { slug } = req.body;
      const page = await PageRepository.getPageBySlug(slug);
      return formSuccess({ data: page || {}, page: !!page });
    } catch (err) {
      next(err);
    }
  }

  async updateTerms(req, res, next) {
    try {
      const { title, content } = req.body;
      await PageRepository.updateTerms(title, content);
      return formSuccess({ msg: "Page updated" });
    } catch (err) {
      next(err);
    }
  }

  async updatePrivacyPolicy(req, res, next) {
    try {
      const { title, content } = req.body;
      await PageRepository.updatePrivacyPolicy(title, content);
      return formSuccess({ msg: "Page updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PageController;
