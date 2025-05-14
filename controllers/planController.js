const PlanService = require("../services/planService");
const { addDaysToCurrentTimestamp } = require("../utils/dateUtils");
const { User } = require("../models");
const UidandPlanRequiredException = require("../exceptions/CustomExceptions/UidandPlanRequiredException");

class PlanController {
  planService;

  constructor() {
    this.planService = new PlanService();
  }

  async addPlan(req, res, next) {
    try {
      const planData = req.body;
      await this.planService.addPlan(planData);
      res.json({ success: true, msg: "Plan has been updated" });
    } catch (err) {
      next(err);
    }
  }

  async getPlans(req, res, next) {
    try {
      const plans = await this.planService.getPlans();
      res.json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  }

  async deletePlan(req, res, next) {
    try {
      const { id } = req.body;
      await this.planService.deletePlan(id);
      res.json({ success: true, msg: "Plan was deleted" });
    } catch (err) {
      next(err);
    }
  }

  async updatePlan(req, res, next) {
    try {
      const { plan, uid } = req.body;
      console.log({ plan });

      if (!uid || !plan || !plan.id) {
        throw new UidandPlanRequiredException();
      }

      const planDays = parseInt(plan?.plan_duration_in_days || 0);

      const timeStamp = addDaysToCurrentTimestamp(planDays);


      await User.update(
        { plan: JSON.stringify(plan), plan_expire: timeStamp },
        { where: { uid } }
      );
      

      res.json({ success: true, msg: "User plan was updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PlanController;
