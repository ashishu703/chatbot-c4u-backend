const { User } = require("../models");

class UserRepository {
  static async getUsers() {
    return await User.findAll();
  }

  static async create(userData) {
    return await User.create(userData);
  }

  static async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  static async findById(uid) {
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async updateUser(uid, data) {
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return await user.update(data);
  }

  static async deleteUser(id) {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    await user.destroy();
    return user;
  }

  static async findByApiKey(api_key) {
    return await User.findOne({ where: { api_key } });
  }

  static async updatePlan(uid, plan) {
    const plan_expire = new Date();
    plan_expire.setDate(plan_expire.getDate() + plan.plan_duration_in_days);

    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    return await user.update({
      plan,
      plan_expire,
      trial: plan.is_trial
    });
  }

  static async update(uid, userData) {
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    return await user.update({
      name: userData.name,
      email: userData.email,
      password: userData.password || user.password,
      mobile_with_country_code: userData.mobile_with_country_code,
      timezone: userData.timezone,
    });
  }

  static async delete(uid) {
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    await user.destroy();
    return user;
  }
}

module.exports = UserRepository;
