const TranslationService = require('../services/TranslationService');

class TranslationController {
  translationService;
  constructor() {
    this.translationService = TranslationService;
  }
  async getOneTranslation(req, res) {
    try {
      const result = await this.translationService.getOneTranslation(req.query.code);
      res.json(result);
    } catch (error) {
      res.json({ err: error.message, msg: 'server error' });
      console.log(error);
    }
  }

  async getAllTranslationNames(req, res) {
    try {
      const result = await this.translationService.getAllTranslationNames();
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Server error', err: error.message });
      console.log(error);
    }
  }

  async updateTranslation(req, res) {
    try {
      const result = await this.translationService.updateTranslation(req.body.code, req.body.updatedjson);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }

  async addNewTranslation(req, res) {
    try {
      const result = await this.translationService.addNewTranslation(req.body.newcode);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }

  async deleteTranslation(req, res) {
    try {
      const result = await this.translationService.deleteTranslation(req.body.code);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }
}

module.exports = TranslationController;