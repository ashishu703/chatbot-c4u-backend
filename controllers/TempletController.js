const TempletService = require("../services/templetService");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const { formSuccess } = require("../utils/response.utils");
class TempletController {
  templetService;
  constructor() {
    this.templetService = new TempletService();
  }
   async addTemplate(req, res, next) {
    try {
      const { title, type, content } = req.body;
      const user = req.decode;
      if (!title || !type || !content) {
       throw new FillAllFieldsException();
      }
      const result = await this.templetService.addTemplate(user.uid, { title, type, content });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async getTemplates(req, res, next) {
    try {
      const user = req.decode;
      const templates = await this.templetService.getTemplates(user.uid);
      return formSuccess({ data: templates });
    } catch (err) {
      next(err);
    }
  }

   async deleteTemplates(req, res, next) {
    try {
      const { selected } = req.body;
      const result = await this.templetService.deleteTemplates(selected);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TempletController;