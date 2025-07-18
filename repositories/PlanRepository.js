const { Plan } = require("../models");
const Repository = require("./Repository");

class PlanRepository extends Repository {
  constructor() {
    super(Plan);
  }
  async addPlan(plan) {
    return this.create(plan);
  }

  async getPlans() {
    return this.find({
      attributes: [
        "id",
        "title",
        "short_description",
        "allow_tag",
        "allow_note",
        "allow_chatbot",
        "contact_limit",
        "allow_api",
        "is_trial",
        "price",
        "price_strike",
        "plan_duration_in_days",
        "createdAt",
        "updatedAt",
      ],
      order: [["id", "DESC"]],
    });
  }

  async deletePlan(id) {
    return this.delete({ id });
  }
  async findPlanById(id) {
    return this.findById(id);
  }
  async getPlanById(id) {
    return this.find({ where: { id } }); 
  }

}

module.exports = PlanRepository;
