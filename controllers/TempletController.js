const TempletService = require("../services/TempletService");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const { where } = require("sequelize");
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
      await this.templetService.addTemplate(user.uid, { title, type, content });
      return formSuccess(res,{ msg: __t("template_added") });
    } catch (err) {
      next(err);
    }
  }

   async getTemplates(req, res, next) {
    try {
      const user = req.decode;
      const query = req.query;
      const templates = await this.templetService.getTemplates({
        where: { uid: user.uid },
        ...query,
      });
      return formSuccess(res,{ ...templates });
    } catch (err) {
      next(err);
    }
  }

   async deleteTemplates(req, res, next) {
    try {
      const { selected } = req.body;
       await this.templetService.deleteTemplates(selected);
      return formSuccess(res,{msg: __t("template_deleted")});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TempletController;