const express = require("express");
const router = express.Router();
const DripCampaignController = require("../controllers/DripCampaignController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");

const dripCampaignController = new DripCampaignController();

router.post(
  "/create",
  validateUser,
  checkPlan,
  dripCampaignController.createCampaign.bind(dripCampaignController)
);

router.get(
  "/get_campaigns",
  validateUser,
  dripCampaignController.getCampaigns.bind(dripCampaignController)
);

router.get(
  "/get_campaign/:campaign_id",
  validateUser,
  dripCampaignController.getCampaign.bind(dripCampaignController)
);

router.put(
  "/update_status/:campaign_id",
  validateUser,
  dripCampaignController.updateCampaignStatus.bind(dripCampaignController)
);

router.put(
  "/update/:campaign_id",
  validateUser,
  checkPlan,
  dripCampaignController.updateCampaign.bind(dripCampaignController)
);

router.delete(
  "/delete/:campaign_id",
  validateUser,
  dripCampaignController.deleteCampaign.bind(dripCampaignController)
);

router.post(
  "/process_pending",
  validateUser,
  dripCampaignController.processPendingMessages.bind(dripCampaignController)
);

module.exports = router;
