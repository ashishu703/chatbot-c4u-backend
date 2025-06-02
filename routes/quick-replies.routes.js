const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const QuickRepliesController = require("../controllers/_quick_replies/QuickReplyController.js");
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
