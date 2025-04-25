const translationService = require('../services/translationService');

class TranslationController {
  async getOneTranslation(req, res) {
    try {
      const result = await translationService.getOneTranslation(req.query.code);
      res.json(result);
    } catch (error) {
      res.json({ err: error.message, msg: 'server error' });
      console.log(error);
    }
  }

  async getAllTranslationNames(req, res) {
    try {
      const result = await translationService.getAllTranslationNames();
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Server error', err: error.message });
      console.log(error);
    }
  }

  async updateTranslation(req, res) {
    try {
      const result = await translationService.updateTranslation(req.body.code, req.body.updatedjson);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }

  async addNewTranslation(req, res) {
    try {
      const result = await translationService.addNewTranslation(req.body.newcode);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }

  async deleteTranslation(req, res) {
    try {
      const result = await translationService.deleteTranslation(req.body.code);
      res.json(result);
    } catch (error) {
      res.json({ success: false, error: error.message, msg: 'Server error' });
      console.log(error);
    }
  }
}

module.exports = new TranslationController();