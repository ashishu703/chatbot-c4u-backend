const PlanService = require("../services/planService");

class PlanController {
  planService;

  constructor() {
    this.planService = new PlanService();
  }

  async addPlan(req, res) {
    try {
      const planData = req.body;
      await this.planService.addPlan(planData);
      res.json({ success: true, msg: "Plan has been updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getPlans(req, res) {
    try {
      const plans = await this.planService.getPlans();
      res.json({ success: true, data: plans });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async deletePlan(req, res) {
    try {
      const { id } = req.body;
      await this.planService.deletePlan(id);
      res.json({ success: true, msg: "Plan was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  async updatePlan(req, res) {
    try {
      const { plan, uid } = req.body;
      if (!uid || !plan || !plan.id) {
        return res.status(400).json({ success: false, msg: "UID and valid plan data required" });
      }
  
      await this.planService.updateUserPlan(uid, plan);
      res.json({ success: true, msg: "User plan was updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
  
  
}

module.exports =  PlanController;