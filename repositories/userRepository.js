const { User } = require("../models");
const { addDaysToCurrentTimestamp } = require("../utils/dateUtils");
class UserRepository {
  async findAll() {
    try {
      return await User.findAll(); 
    } catch (error) {
      console.error('Error in userRepository.findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await User.findByPk(id); 
    } catch (error) {
      console.error('Error in userRepository.findById:', error);
      throw error;
    } 
  }

  async getUsers() {
    return await User.findAll();
  }

  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByUid(uid) {
    return await User.findOne({ where: { uid } });
  }

  async updateUser(uid, data) {
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return await user.update(data);
  }

  async deleteUser(id) {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    await user.destroy();
    return user;
  }

  async findByApiKey(api_key) {
    return await User.findOne({ where: { api_key } });
  }

  async updatePlan(uid, plan) {
    try {
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
        plan_expire: timeStamp,   
        trial: plan.is_trial ? 1 : 0 
      });
    } catch (error) {
      console.error("Error updating user plan in UserRepository:", error);
      throw error;
    }
  }
  
  async update(uid, userData) {
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

  async delete(uid) {
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
