const router = require("express").Router();
const ChatFlowController = require("../controllers/chatFlowController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

const chatFlowController = new ChatFlowController();

router.post("/add_new", validateUser, checkPlan, chatFlowController.addFlow.bind(chatFlowController));
router.get("/get_mine", validateUser, chatFlowController.getFlows.bind(chatFlowController));
router.post("/del_flow", validateUser, chatFlowController.deleteFlow.bind(chatFlowController));
router.post("/get_by_flow_id", validateUser, chatFlowController.getByFlowId.bind(chatFlowController));
router.post("/get_activity", validateUser, checkPlan, chatFlowController.getActivity.bind(chatFlowController));
router.post("/remove_number_from_activity", validateUser, chatFlowController.removeNumberFromActivity.bind(chatFlowController));

module.exports = router;