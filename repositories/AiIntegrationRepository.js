const { AiIntegration } = require("../models");

class AiIntegrationRepository {
  async create(data) {
    return await AiIntegration.create(data);
  }

  async findByUserId(userId) {
    return await AiIntegration.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findActiveByUserId(userId) {
    return await AiIntegration.findOne({
      where: { 
        userId,
        isActive: true 
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id) {
    return await AiIntegration.findByPk(id);
  }

  async findByIdAndUserId(id, userId) {
    return await AiIntegration.findOne({
      where: { id, userId },
    });
  }

  async update(id, data) {
    const [affectedRows] = await AiIntegration.update(data, {
      where: { id },
    });
    return affectedRows > 0;
  }

  async updateByUserId(userId, data) {
    const [affectedRows] = await AiIntegration.update(data, {
      where: { userId },
    });
    return affectedRows > 0;
  }

  async delete(id) {
    const affectedRows = await AiIntegration.destroy({
      where: { id },
    });
    return affectedRows > 0;
  }

  async deleteByUserId(userId) {
    const affectedRows = await AiIntegration.destroy({
      where: { userId },
    });
    return affectedRows > 0;
  }

  async deactivateOthers(userId, currentId) {
    const [affectedRows] = await AiIntegration.update(
      { isActive: false },
      {
        where: { 
          userId,
          id: { [require('sequelize').Op.ne]: currentId }
        },
      }
    );
    return affectedRows > 0;
  }
}

module.exports = AiIntegrationRepository;
