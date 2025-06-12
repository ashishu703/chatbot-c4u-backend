const { ChatWidget } = require("../models");
const Repository = require("./Repository");

class ChatWidgetRepository extends Repository {
  constructor() {
    super(ChatWidget);
  }

  async findByUniqueId(unique_id) {
    return await ChatWidget.findOne({ where: { unique_id } });
  }

async deleteChatWidget(uniqueKeys) {
    if (typeof uniqueKeys !== 'object' || Array.isArray(uniqueKeys)) {
    }

    const records = await this.model.findAll({ where: uniqueKeys });
    await this.model.destroy({ where: uniqueKeys });
    return records.map(record => record.toJSON());
}



}

module.exports = ChatWidgetRepository;
