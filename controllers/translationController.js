const TranslationService = require('../services/TranslationService');

class TranslationController {
  translationService;
  constructor() {
    this.translationService = TranslationService;
  }
  async getOneTranslation(req, res, next) {
    try {
      const result = await this.translationService.getOneTranslation(req.query.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllTranslationNames(req, res, next) {
    try {
      const result = await this.translationService.getAllTranslationNames();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateTranslation(req, res, next) {
    try {
      const result = await this.translationService.updateTranslation(req.body.code, req.body.updatedjson);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async addNewTranslation(req, res, next) {
    try {
      const result = await this.translationService.addNewTranslation(req.body.newcode);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteTranslation(req, res, next) {
    try {
      const result = await this.translationService.deleteTranslation(req.body.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TranslationController;