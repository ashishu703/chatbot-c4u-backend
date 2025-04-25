const PlanRepository = require("../repositories/planRepository");
const UserRepository = require("../repositories/userRepository");

class PlanService {
  static async addPlan({
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

  static async getPlans() {
    return await PlanRepository.getPlans();
  }

  static async deletePlan(id) {
    await PlanRepository.deletePlan(id);
  }

  static async updateUserPlan(plan, uid) {
    if (!plan || !uid) throw new Error("Invalid input provided");
    const existingPlan = await PlanRepository.findById(plan.id);
    if (!existingPlan) throw new Error("Invalid plan found");
    await UserRepository.updatePlan(uid, existingPlan);
  }
}

module.exports = PlanService;