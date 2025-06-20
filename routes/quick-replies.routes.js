const router = require("express").Router();
const validateUser = require("../middlewares/user.middleware.js");

const QuickRepliesController = require("../controllers/QuickReplyController.js");
const quickRepliesController = new QuickRepliesController();

router.get(
  "/",
  validateUser,
  quickRepliesController.getQuickReplies.bind(quickRepliesController)
);
router.post(
  "/",
  validateUser,
  quickRepliesController.createQuickReplies.bind(quickRepliesController)
);
router.delete(
  "/:id",
  validateUser,
  quickRepliesController.deleteQuickReplies.bind(quickRepliesController)
);

module.exports = router;
