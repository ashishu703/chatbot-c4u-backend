const { Chatbot } = require("../models");
const Repository = require("./Repository");

class ChatbotRepository extends Repository {
  constructor() {
    super(Chatbot);
  }

  async updateStatus(id, active, uid) {
    return this.update({ active }, { id, uid });
  }

  async findByStatus(uid, active) {
    return this.find({ where: { uid, active } });
  }

  async countByUid(uid) {
    return this.count({ where: { uid } });
  }

async deletechatbot(id) {
  if (!id || typeof id !== 'number') {
  }

  const records = await this.model.findAll({ where: { id } });
  await this.model.destroy({ where: { id } });

  return records.map(record => record.toJSON());
}

}

module.exports = ChatbotRepository;
