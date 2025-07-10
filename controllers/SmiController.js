const SmiService = require('../services/SmiService');
const { formSuccess } = require('../utils/response.utils');

class SmiController {
  constructor() {
    this.smiService = new SmiService();
  }
  async getAuthParams(req, res, next) {
    try {
      const params = await this.smiService.getAuthParams();
      return formSuccess(res, params);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SmiController;