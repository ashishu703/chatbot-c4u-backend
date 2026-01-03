const { Integration } = require("../models");

class IntegrationRepository {
  async create(data) {
    return await Integration.create(data);
  }

  async findById(id) {
    return await Integration.findByPk(id);
  }

  async findByUserId(userId) {
    return await Integration.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findByUserIdAndType(userId, type) {
    return await Integration.findOne({
      where: { userId, type },
    });
  }

  async findByIdAndUserId(id, userId) {
    return await Integration.findOne({
      where: { id, userId },
    });
  }

  async update(id, data) {
    const [updated] = await Integration.update(data, {
      where: { id },
    });
    if (updated === 0) {
      throw new Error("Integration not found");
    }
    return await this.findById(id);
  }

  async delete(id) {
    const deleted = await Integration.destroy({
      where: { id },
    });
    if (deleted === 0) {
      throw new Error("Integration not found");
    }
    return true;
  }

  async deleteByUserIdAndType(userId, type) {
    return await Integration.destroy({
      where: { userId, type },
    });
  }
}

module.exports = IntegrationRepository;

