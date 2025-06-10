const PageRepository = require("../repositories/pageRepository");
const FileService = require("../services/fileService");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const { formSuccess } = require("../utils/response.utils");
const{ __t } = require("../utils/locale.utils")
class PageController {
  fileService;
  pageRepository;
  constructor() {
    this.fileService = new FileService();
    this.pageRepository = new PageRepository();
  }

  async addPage(req, res, next) {
    try {
      const { title, content, slug } = req.body;
      const file = req.files?.file;

      if (!file) {
        throw new NoFilesWereUploadedException();
      }

      const filename = await this.fileService.uploadFile(file);
      await this.pageRepository.addPage({ title, content, slug, image: filename });

      return formSuccess(res,{  msg: __t("page_was_added"),

       });
    } catch (err) {
      next(err);
    }
  }

  async getPages(req, res, next) {
    try {
      const pages = await this.pageRepository.getPages();
      return formSuccess(res,{ data: pages });
    } catch (err) {
      next(err);
    }
  }

  async deletePage(req, res, next) {
    try {
      const { id } = req.body;
      await this.pageRepository.deletePage(id);
      return formSuccess(res,{ msg: __t("page_was_deleted"),

       });
    } catch (err) {
      next(err);
    }
  }

  async getPageBySlug(req, res, next) {
    try {
      const { slug } = req.body;
      const page = await this.pageRepository.getPageBySlug(slug);
      return formSuccess(res,{ data: page || {}, page: !!page });
    } catch (err) {
      next(err);
    }
  }

  async updateTerms(req, res, next) {
    try {
      const { title, content } = req.body;
      await this.pageRepository.updateTerms(title, content);
      return formSuccess(res,{ msg: __t("page_updated"),
        
       });
    } catch (err) {
      next(err);
    }
  }

  async updatePrivacyPolicy(req, res, next) {
    try {
      const { title, content } = req.body;
      await this.pageRepository.updatePrivacyPolicy(title, content);
      return formSuccess(res,{ msg: __t("page_updated"),
        
       });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PageController;
