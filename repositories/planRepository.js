const { Plan } = require("../models/plan");

class PlanRepository {
  static async addPlan(plan) {
    await Plan.create(plan);
  }

  static async getPlans() {
    return await Plan.findAll();
  }

  static async deletePlan(id) {
    await Plan.destroy({ where: { id } });
  }

  static async findById(id) {
    return await Plan.findByPk(id);
  }
}

module.exports = PlanRepository;