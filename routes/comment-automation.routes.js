const express = require("express");
const router = express.Router();

const validateUser = require("../middlewares/user.middleware.js");

// Import controller
const CommentAutomationController = require("../controllers/CommentAutomationController.js");

// Instantiate controller
const commentAutomationController = new CommentAutomationController();

// -------- FACEBOOK COMMENT AUTOMATION ROUTES --------
router.post(
  "/facebook/comment/save_settings",
  validateUser,
  commentAutomationController.saveSettings.bind(commentAutomationController)
);

router.get(
  "/facebook/comment/get_settings",
  validateUser,
  commentAutomationController.getSettings.bind(commentAutomationController)
);

router.put(
  "/facebook/comment/update_settings",
  validateUser,
  commentAutomationController.updateSettings.bind(commentAutomationController)
);

router.delete(
  "/facebook/comment/delete_settings",
  validateUser,
  commentAutomationController.deleteSettings.bind(commentAutomationController)
);

router.get(
  "/facebook/comment/analytics",
  validateUser,
  commentAutomationController.getAnalytics.bind(commentAutomationController)
);

router.post(
  "/facebook/comment/toggle_status",
  validateUser,
  commentAutomationController.toggleActiveStatus.bind(commentAutomationController)
);

// -------- INSTAGRAM COMMENT AUTOMATION ROUTES --------
router.post(
  "/instagram/comment/save_settings",
  validateUser,
  commentAutomationController.saveSettings.bind(commentAutomationController)
);

router.get(
  "/instagram/comment/get_settings",
  validateUser,
  commentAutomationController.getSettings.bind(commentAutomationController)
);

router.put(
  "/instagram/comment/update_settings",
  validateUser,
  commentAutomationController.updateSettings.bind(commentAutomationController)
);

router.delete(
  "/instagram/comment/delete_settings",
  validateUser,
  commentAutomationController.deleteSettings.bind(commentAutomationController)
);

router.get(
  "/instagram/comment/analytics",
  validateUser,
  commentAutomationController.getAnalytics.bind(commentAutomationController)
);

router.post(
  "/instagram/comment/toggle_status",
  validateUser,
  commentAutomationController.toggleActiveStatus.bind(commentAutomationController)
);

// -------- GENERAL COMMENT AUTOMATION ROUTES --------
router.get(
  "/comment/settings",
  validateUser,
  commentAutomationController.getAllUserSettings.bind(commentAutomationController)
);

module.exports = router;

