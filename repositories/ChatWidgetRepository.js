const { ChatWidget } = require("../models");
const Repository = require("./Repository");

class ChatWidgetRepository extends Repository {
  constructor() {
    super(ChatWidget);
  }

  async findByUniqueId(unique_id) {
    return await ChatWidget.findOne({ where: { unique_id } });
  }

}

module.exports = ChatWidgetRepository;
