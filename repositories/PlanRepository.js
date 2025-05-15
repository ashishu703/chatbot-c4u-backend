const {Plan} = require("../models");            

class PlanRepository {
  static async addPlan(plan) {
    await Plan.create(plan);
  }

  static async getPlans() {
    return await Plan.findAll({
      attributes: [
        'id',
        'title',
        'short_description',
        'allow_tag',
        'allow_note',
        'allow_chatbot',
        'contact_limit',
        'allow_api',
        'is_trial',
        'price',
        'price_strike',
        'plan_duration_in_days',
        'createdAt',
        'updatedAt'
      ],
      order: [['id', 'DESC']]
    });
  }

  static async deletePlan(id) {
    await Plan.destroy({ where: { id } });
  }

  static async findById(id) {
    return await Plan.findByPk(id);
  }
}

module.exports = PlanRepository;
