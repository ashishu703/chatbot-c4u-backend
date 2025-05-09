const { ChatWidget } = require('../models');

class ChatWidgetRepository {
  static async findByUid(uid) {
    return await ChatWidget.findAll({ where: { uid } });
  }

  static async delete(id) {
    return await ChatWidget.destroy({ where: { id } });
  }

  static async findByUniqueId(uniqueId) {
    return await ChatWidget.findOne({ where: { unique_id: uniqueId } });
  }

  static async create(data) {
    return await ChatWidget.create(data);
  }
}

module.exports = ChatWidgetRepository;
