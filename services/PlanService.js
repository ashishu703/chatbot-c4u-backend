const PlanRepository = require("../repositories/PlanRepository");
const UserRepository = require("../repositories/UserRepository");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidPlanFoundException = require("../exceptions/CustomExceptions/InvalidPlanFoundException");
const { addDaysToCurrentTimestamp, millisecondsToSeconds } = require("../utils/date.utils");

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

  async updateUserPlan(uid, planId) {
    const plan = await this.planRepository.findById(planId);

    if (!plan) throw new InvalidPlanFoundException();

    const planDays = parseInt(plan?.plan_duration_in_days || 0);

    const timeStamp = addDaysToCurrentTimestamp(planDays);

    return this.userRepository.update(
      { plan_id: plan.id, plan_expiration: timeStamp },
      { uid }
    );
  }
}

module.exports = PlanService;
