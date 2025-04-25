const ChatWidget = require('../models/chat_widget');

class WidgetRepository {
  async create(widgetData) {x
    return await ChatWidget.create(widgetData);
  }

  async findByUid(uid) {
    return await ChatWidget.findAll({ where: { uid } });
  }

  async delete(id) {
    return await ChatWidget.destroy({ where: { id } });
  }

  async findByUniqueId(unique_id) {
    return await ChatWidget.findOne({ where: { unique_id } });
  }
}

module.exports = new WidgetRepository();