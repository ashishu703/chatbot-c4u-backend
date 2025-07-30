const { User, Plan, WebPrivate } = require("../models");
const { addDaysToCurrentTimestamp } = require("../utils/date.utils");
const Repository = require("./Repository");
class UserRepository extends Repository {
  constructor() {
    super(User, Plan, WebPrivate);
  }

  async findByEmail(email) {
    return this.model.findOne({ where: { email } });
  }

  async updateUser(uid, data) {
    return this.update(data, { uid });
  }

  async findByApiKey(api_key) {
    return this.findFirst({ where: { api_key } });
  }

  async updatePlan(uid, plan) {
    const planDays = parseInt(plan.plan_duration_in_days || 0);
    const timeStamp = addDaysToCurrentTimestamp(planDays);

    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    return await user.update({
      plan: JSON.stringify(plan),
      plan_expiration: timeStamp,
      trial: plan.is_trial ? 1 : 0,
    });
  }

  async updateByUid(uid, updateData) {
    const user = await this.model.findOne({ where: { uid } });
    if (!user) throw new Error("User not found");
    return await user.update(updateData);
  }
}

module.exports = UserRepository;
