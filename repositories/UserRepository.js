const { User } = require("../models");
const { addDaysToCurrentTimestamp } = require("../utils/date.utils");
const Repository = require("./Repository");
class UserRepository extends Repository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findFirst({ where: { email } });
  }

  async updateUser(uid, data) {
    return this.update(data, { uid });
  }

  async findByApiKey(api_key) {
    return this.findFirst({ where: { api_key } });
  }

  // async updatePlan(uid, plan) {
  //   try {
  //     const planDays = parseInt(plan.plan_duration_in_days || 0);
  //     const timeStamp = addDaysToCurrentTimestamp(planDays);

  //     const user = await User.findOne({ where: { uid } });
  //     if (!user) {
  //       const err = new Error("User not found");
  //       err.status = 404;
  //       throw err;
  //     }

  //     return await user.update({
  //       plan: JSON.stringify(plan),
  //       plan_expire: timeStamp,
  //       trial: plan.is_trial ? 1 : 0,
  //     });
  //   } catch (error) {
  //     console.error("Error updating user plan in UserRepository:", error);
  //     throw error;
  //   }
  // }

 
}

module.exports = UserRepository;
