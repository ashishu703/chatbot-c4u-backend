const TranslationService = require('../services/TranslationService');
const { formSuccess } = require('../utils/response.utils');

class TranslationController {
  translationService;
  constructor() {
    this.translationService = new TranslationService();
  }
  async getOneTranslation(req, res, next) {
    try {
      const result = await this.translationService.getOneTranslation(req.query.code);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllTranslationNames(req, res, next) {
    try {
      const result = await this.translationService.getAllTranslationNames();
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async updateTranslation(req, res, next) {
    try {
      const result = await this.translationService.updateTranslation(req.body.code, req.body.updatedjson);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async addNewTranslation(req, res, next) {
    try {
      const result = await this.translationService.addNewTranslation(req.body.newcode);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteTranslation(req, res, next) {
    try {
      const result = await this.translationService.deleteTranslation(req.body.code);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TranslationController;