const { QuickReply } = require("../models");
const Repository = require("./Repository");

class QuickReplyRepository extends Repository {
  constructor() {
    super(QuickReply);
  }

  async createIfNotExist({ uid, message }) {
    return this.updateOrCreate({ uid, message }, { message, uid });
  }
  async createQuickReply({ uid, message }) {
    return this.create({ uid, message });
  }

  async findChatByMessageAndUid(uid, message) {
    return this.findFirst({ where: { uid, message } });
  }

  async findUidId(uid) {
    return this.find({ where: { uid } });
  }

  async removeById(id) {
    return this.delete({ id });
  }
};

module.exports = QuickReplyRepository