const PlanRepository = require("../repositories/planRepository");
const UserRepository = require("../repositories/UserRepository");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const UserNotFoundException = require("../exceptions/CustomExceptions/UserNotFoundException");
const InvalidUidOrPlanException = require("../exceptions/CustomExceptions/InvalidUidOrPlanException");

class PlanService {
  constructor() {
    this.userRepository = new UserRepository();
    this.planRepository = new PlanRepository();
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
      throw new FillAllFieldsException();
    }
    await this.planRepository.addPlan({
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

  async getPlans(query) {
    return await this.planRepository.paginate(query);
  }

  async deletePlan(id) {
    await this.planRepository.deletePlan(id);
  }

  async updateUserPlan(uid, plan) {
    if (!uid || !plan || !plan.id) {
      throw new InvalidUidOrPlanException();
    }
    const user = await this.userRepository.findByUid(uid);
    if (!user) {
      throw new UserNotFoundException();
    }
    const updatedUser = await this.userRepository.updatePlan(uid, {
      id: plan.id,
      plan_duration_in_days: plan.plan_duration_in_days,
      is_trial: plan.is_trial,
    });
    return updatedUser;
  }
}

module.exports = PlanService;
