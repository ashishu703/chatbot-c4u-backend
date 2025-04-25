const express = require("express");
const router = express.Router();
const BroadcastController = require("../controllers/broadcastController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

router.post("/add_new", validateUser, checkPlan, BroadcastController.addBroadcast);
router.get("/get_broadcast", validateUser, BroadcastController.getBroadcasts);
router.post("/get_broadcast_logs", validateUser, BroadcastController.getBroadcastLogs);
router.post("/change_broadcast_status", validateUser, BroadcastController.changeBroadcastStatus);
router.post("/del_broadcast", validateUser, BroadcastController.deleteBroadcast);

module.exports = router;