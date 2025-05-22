const QuickReplyRepository = require("../repositories/QuickReplyRepository");

module.exports = class QuickReplyService {
  constructor() {}

  async create({ uid, message }) {
    return QuickReplyRepository.createIfNotExist({
      uid,
      message,
    });
  }

  async destroy(id) {
    return QuickReplyRepository.removeById(id);
  }

  async list(uid) {
    return QuickReplyRepository.findUidId(uid);
  }
};
