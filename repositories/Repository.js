const { Op, literal } = require("sequelize");
class Repository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const record = await this.model.create(data);
    return record.toJSON();
  }

  async bulkCreate(data) {
    const records = await this.model.bulkCreate(data);
    return records.map((record) => record.toJSON());
  }

async update(data, uniqueKeys = {}) {
  if (!uniqueKeys.id || !uniqueKeys.uid) {
  }
  const [rowsUpdated] = await this.model.update(data, { where: uniqueKeys });
  if (rowsUpdated === 0) {
  }
  return this.model.findAll({ where: uniqueKeys });
}


  async delete(uniqueKeys) {
    if (typeof uniqueKeys === "string" || typeof uniqueKeys === "number") {
      uniqueKeys = { id: uniqueKeys };
    }
    if (
      typeof uniqueKeys !== "object" ||
      Array.isArray(uniqueKeys) ||
      uniqueKeys === null
    ) {
      throw new Error(
        "Invalid input for delete: uniqueKeys must be an object or ID."
      );
    }
    const records = await this.model.findAll({ where: uniqueKeys });
    await this.model.destroy({ where: uniqueKeys });
    return records.map((record) => record.toJSON());
  }

  async find(condition = {}, relations = []) {
    const records = await this.model.findAll({
      ...condition,
      include: relations,
    });
    return records.map((record) => record.toJSON());
  }

  async count(condition = {}) {
    return this.model.count(condition);
  }

  async findFirst(condition = {}, relations = []) {
    const record = await this.model.findOne({
      ...condition,
      include: relations,
    });
    return record ? record.toJSON() : null;
  }

async findById(uid, relations = []) {
  const record = await this.model.findOne({
    where: { uid },
    include: relations,
  });
  return record ? record.toJSON() : null;
}


  async findByUid(uid, relations = []) {
    const record = await this.model.findOne({
      where: { uid },
      include: relations,
    });
    return record ? record.toJSON() : null;
  }

  async findByChatId(chatId, relations = []) {
    const record = await this.model.findOne({
      where: { chat_id: chatId },
      include: relations,
    });
    return record ? record.toJSON() : null;
  }

  async updateOrCreate(data, uniqueKeys = {}) {
    const [record] = await this.model.upsert(
      { ...data, ...uniqueKeys },
      { returning: true }
    );
    return record.toJSON();
  }

  async deleteByIds(ids) {
    const records = await this.model.findAll({ where: { id: ids } });
    await this.model.destroy({ where: { id: ids } });
    return records.map((record) => record.toJSON());
  }

  async createIfNotExists(data, uniqueKeys = {}) {
    const [record, created] = await this.model.findOrCreate({
      where: uniqueKeys,
      defaults: data,
    });
    return record.toJSON();
  }
}

module.exports = Repository;
