const express = require("express");
const router = express.Router();
const FlowController = require("../controllers/chatFlowController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

router.post("/add_new", validateUser, checkPlan, FlowController.addFlow);
router.get("/get_mine", validateUser, FlowController.getFlows);
router.post("/del_flow", validateUser, FlowController.deleteFlow);
router.post("/get_by_flow_id", validateUser, FlowController.getFlowById);
router.post("/get_activity", validateUser, checkPlan, FlowController.getActivity);
router.post("/remove_number_from_activity", validateUser, FlowController.removeNumberFromActivity);

module.exports = router;
