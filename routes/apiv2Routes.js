const express = require("express");
const router = express.Router();
const ApiController = require("../controllers/apiv2Controller");

router.post("/send-message", ApiController.sendMessage);
router.post("/send_templet", ApiController.sendTemplate);

module.exports = router;