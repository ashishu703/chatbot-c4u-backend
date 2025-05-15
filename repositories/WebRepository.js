const {
  WebPublic,
  WebPrivate,
  Smtp
} = require('../models');

class WebRepository {
  // Fetches one record from the WebPublic model
  async getWebPublic() {
    try {
      return await WebPublic.findOne();
    } catch (error) {
      console.error('Error fetching WebPublic:', error);
      throw error;
    }
  }
  async getWebPrivate() {
    try {
      return await WebPrivate.findOne();
    } catch (error) {
      console.error('Error fetching WebPrivate:', error);
      throw error;
    }
  }

  // Fetches one record from the Smtp model
  async getSmtp() {
    try {
      return await Smtp.findOne();
    } catch (error) {
      console.error('Error fetching Smtp:', error);
      throw error;
    }
  }
}

module.exports = WebRepository;
