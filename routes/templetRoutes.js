const express = require("express");
const router = express.Router();
const TempletController = require("../controllers/templetController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

router.post("/add_new", validateUser, checkPlan, TempletController.addTemplate);
router.get("/get_templets", validateUser, TempletController.getTemplates);
router.post("/del_templets", validateUser, TempletController.deleteTemplates);

module.exports = router;