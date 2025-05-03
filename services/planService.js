const PlanRepository = require("../repositories/planRepository");
const UserRepository = require("../repositories/UserRepository");

class PlanService {
  
  constructor() {
    this.userRepository = new UserRepository();
  }
   async addPlan({
    title,
    short_description,
    allow_tag,
    allow_note,
    allow_chatbot,
    contact_limit,
    allow_api,
    is_trial,
    price,
    price_strike,
    plan_duration_in_days,
  }) {
    if (!title || !short_description || !plan_duration_in_days) {
      throw new Error("Please fill details");
    }
    await PlanRepository.addPlan({
      title,
      short_description,
      allow_tag: !!allow_tag,
      allow_note: !!allow_note,
      allow_chatbot: !!allow_chatbot,
      contact_limit: parseInt(contact_limit || 0),
      allow_api: !!allow_api,
      is_trial: !!is_trial,
      price: is_trial ? 0 : parseFloat(price || 0),
      price_strike: price_strike ? parseFloat(price_strike) : null,
      plan_duration_in_days: parseInt(plan_duration_in_days || 1),
    });
  }

   async getPlans() {
    return await PlanRepository.getPlans();
  }

   async deletePlan(id) {
    await PlanRepository.deletePlan(id);
  }

  async updateUserPlan(uid, plan) {
    if (!uid || !plan || !plan.id) {
      throw new Error("Invalid UID or Plan data");
    }

    try {
      const user = await this.userRepository.findByUid(uid);
      if (!user) {
        throw new Error("User not found");
      }
      const updatedUser = await this.userRepository.updatePlan(uid, {
        id: plan.id,
        plan_duration_in_days: plan.plan_duration_in_days,
        is_trial: plan.is_trial
      });
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUserPlan:", error);
      throw error;
    }
  }
  
  
}

module.exports = PlanService;