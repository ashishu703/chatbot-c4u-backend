const db = require('../models');
const WebPublic = db.WebPublic;

class WebConfigRepository {
  async findFirst() {
    try {
      return await WebPublic.findOne({ where: { id: 1 } });
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  }

  async update(id, configData) {
    try {
      const config = await WebPublic.findByPk(id);
      if (!config) return null;
      return await config.update(configData);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }
}

module.exports = new WebConfigRepository();
