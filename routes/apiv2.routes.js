const express = require("express");
const router = express.Router();
const ApiV2Controller = require("../controllers/Apiv2Controller");

const apiv2Controller = new ApiV2Controller();

router.post("/send-message", apiv2Controller.sendMessage.bind(apiv2Controller));
router.post(
  "/send_templet",
  apiv2Controller.sendTemplate.bind(apiv2Controller)
);

module.exports = router;
