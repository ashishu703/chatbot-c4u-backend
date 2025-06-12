const PlanService = require("../services/planService");
const { addDaysToCurrentTimestamp } = require("../utils/date.utils");
const { User } = require("../models");
const UidandPlanRequiredException = require("../exceptions/CustomExceptions/UidandPlanRequiredException");
const { formSuccess } = require("../utils/response.utils");
const{ __t }= require("../utils/locale.utils")

class PlanController {
  planService;

  constructor() {
    this.planService = new PlanService();
  }

  async addPlan(req, res, next) {
    try {
      const planData = req.body;
      await this.planService.addPlan(planData);
      return formSuccess(res,{ msg: __t("plan_updated"),

       });
    } catch (err) {
      next(err);
    }
  }

  async getPlans(req, res, next) {
    try {
      const query  = req.query;
      const plans = await this.planService.getPlans(query);
      return formSuccess(res,{ ...plans });
    } catch (err) {
      next(err);
    }
  }

  async deletePlan(req, res, next) {
    try {
      const { id } = req.body;
      await this.planService.deletePlan(id);
      return formSuccess(res,{ msg: __t("plan_was_deleted"),

      });
    } catch (err) {
      next(err);
    }
  }

  async updatePlan(req, res, next) {
    try {
      const { plan, uid } = req.body;
      if (!uid || !plan || !plan.id) {
        throw new UidandPlanRequiredException();
      }

      const planDays = parseInt(plan?.plan_duration_in_days || 0);

      const timeStamp = addDaysToCurrentTimestamp(planDays);


      await User.update(
        { plan: JSON.stringify(plan), plan_expire: timeStamp },
        { where: { uid } }
      );
      

      return formSuccess(res,{ msg: __t("user_plan_updated"), });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PlanController;
