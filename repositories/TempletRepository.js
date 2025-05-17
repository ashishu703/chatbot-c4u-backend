const { Templets } = require("../models");

class TempletRepository {
  async create(template) {
    return await Templets.create(template);
  }

  async findByUid(uid) {
    return await Templets.findAll({ where: { uid } });
  }

  async deleteByIds(ids) {
    return await Templets.destroy({ where: { id: ids } });
  }
}

module.exports = TempletRepository;
