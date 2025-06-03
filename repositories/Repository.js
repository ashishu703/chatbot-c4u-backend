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

    async find(condition = {}, ralations = []) {
        return this.model.findAll({
            ...condition,
            ralations
        });
    }
    async count(condition = {}) {
        return this.model.findAll(condition);
    }

    async findFirst(condition = {}, ralations = []) {
        return this.model.findOne({
            ...condition,
            ralations
        });
    }

    async findById(id, ralations = []) {
        return this.model.findOne({ where: { id } }, ralations);
    }

    async findByUid(uid, ralations = []) {
        return this.model.findOne({ where: { uid } }, ralations);
    }
    async findByChatId(chatId, ralations = []) {
        return this.model.findOne({ where: { chat_id: chatId } }, ralations);
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