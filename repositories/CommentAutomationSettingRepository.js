const Repository = require("./Repository");
const { CommentAutomationSetting } = require("../models");

class CommentAutomationSettingRepository extends Repository {
    constructor() {
        super(CommentAutomationSetting);
    }

    async findByUserAndPlatform(uid, platform, relations = []) {
        const record = await this.model.findOne({
            where: { uid, platform },
            include: relations
        });
        return record ? record.toJSON() : null;
    }

    async findByUser(uid, relations = []) {
        const records = await this.model.findAll({
            where: { uid },
            include: relations
        });
        return records.map(record => record.toJSON());
    }

    async findByPlatform(platform, relations = []) {
        const records = await this.model.findAll({
            where: { platform },
            include: relations
        });
        return records.map(record => record.toJSON());
    }

    async findActiveSettings(uid, platform, relations = []) {
        const record = await this.model.findOne({
            where: { uid, platform, is_active: true },
            include: relations
        });
        return record ? record.toJSON() : null;
    }

    async updateOrCreateByUserAndPlatform(data) {
        const { uid, platform } = data;
        return this.updateOrCreate(data, { uid, platform });
    }

    async deactivateUserSettings(uid, platform) {
        await this.model.update(
            { is_active: false },
            { where: { uid, platform } }
        );
    }

    async activateUserSettings(uid, platform) {
        await this.model.update(
            { is_active: true },
            { where: { uid, platform } }
        );
    }
}

module.exports = CommentAutomationSettingRepository;


