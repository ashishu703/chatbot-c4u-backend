class Repository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return this.model.create(data);
    }

    async bulkCreate(data) {
        return this.model.bulkCreate(data);
    }

    async update(data, uniqueKeys = {}) {
        return this.model.update(data, { where: uniqueKeys });
    }

    async delete(uniqueKeys) {
        return this.model.destroy({ where: uniqueKeys });
    }

    async find(condition = {}) {
        return this.model.findAll(condition);
    }
    async count(condition = {}) {
        return this.model.findAll(condition);
    }

    async findFirst(condition = {}) {
        return this.model.findOne(condition);
    }

    async findById(id) {
        return this.model.findOne({ where: { id } });
    }

    async findByUid(uid) {
        return this.model.findOne({ where: { uid } });
    }
    async findByChatId(chatId) {
        return this.model.findOne({ where: { chat_id: chatId } });
    }

    async updateOrCreate(data, uniqueKeys = {}) {
        return this.model.upsert({ ...data, ...uniqueKeys }, { where: uniqueKeys });
    }

    async deleteByIds(ids) {
        return this.model.destroy({ where: { id: { $in: ids } } });
    }

    async createIfNotExists(data, uniqueKeys = {}) {
        return this.model.findOrCreate({ where: uniqueKeys, defaults: data });
    }
}

module.exports = Repository;