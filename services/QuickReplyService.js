const QuickReplyRepository = require("../repositories/QuickReplyRepository");

class QuickReplyService {

  constructor() {
    this.quickReplyRepository = new QuickReplyRepository();
  }

  async create({ uid, message }) {
    return this.quickReplyRepository.createIfNotExist({
      uid,
      message,
    });
  }

  async destroy(id) {
    return this.quickReplyRepository.removeById(id);
  }

  async list(uid) {
    return this.quickReplyRepository.findUidId(uid);
  }
};
module.exports = QuickReplyService