const express = require("express");
const router = express.Router();
const TempletController = require("../controllers/templetController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");

const templateController = new TempletController();

router.post(
  "/add_new",
  validateUser,
  checkPlan,
  templateController.addTemplate.bind(templateController)
);
router.get(
  "/get_templets",
  validateUser,
  templateController.getTemplates.bind(templateController)
);
router.post(
  "/del_templets",
  validateUser,
  templateController.deleteTemplates.bind(templateController)
);

module.exports = router;
