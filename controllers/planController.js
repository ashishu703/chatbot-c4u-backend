const PlanService = require("../services/planService");

class PlanController {
  static async addPlan(req, res) {
    try {
      const planData = req.body;
      await PlanService.addPlan(planData);
      res.json({ success: true, msg: "Plan has been updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getPlans(req, res) {
    try {
      const plans = await PlanService.getPlans();
      res.json({ success: true, data: plans });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async deletePlan(req, res) {
    try {
      const { id } = req.body;
      await PlanService.deletePlan(id);
      res.json({ success: true, msg: "Plan was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async updatePlan(req, res) {
    try {
      const { plan, uid } = req.body;
      await PlanService.updateUserPlan(plan, uid);
      res.json({ success: true, msg: "User plan was updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = PlanController;