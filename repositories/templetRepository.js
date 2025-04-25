const { Templet } = require("../models/templets");

class TempletRepository {
  static async create(template) {
    return await Templet.create(template);
  }

  static async findByUid(uid) {
    return await Templet.findAll({ where: { uid } });
  }

  static async deleteByIds(ids) {
    return await Templet.destroy({ where: { id: ids } });
  }
}

module.exports = TempletRepository;