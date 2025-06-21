const express = require("express");
const router = express.Router();
const BroadcastController = require("../controllers/broadcastController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");

const broadcastController = new BroadcastController();

router.post(
  "/add_new",
  validateUser,
  checkPlan,
  broadcastController.addBroadcast.bind(broadcastController)
);
router.get(
  "/get_broadcast",
  validateUser,
  broadcastController.getBroadcasts.bind(broadcastController)
);
router.post(
  "/get_broadcast_logs",
  validateUser,
  broadcastController.getBroadcastLogs.bind(broadcastController)
);
router.post(
  "/change_broadcast_status",
  validateUser,
  broadcastController.changeBroadcastStatus.bind(broadcastController)
);
router.post(
  "/del_broadcast",
  validateUser,
  broadcastController.deleteBroadcast.bind(broadcastController)
);

module.exports = router;
