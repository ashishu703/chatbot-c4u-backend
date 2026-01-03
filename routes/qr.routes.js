const express = require("express");
const router = express.Router();
const QRController = require("../controllers/QRController");
const validateUser = require("../middlewares/user.middleware");

const qrController = new QRController();

// User QR routes (protected)
// IMPORTANT: Specific routes must come before parameterized routes
router.post(
  "/generate",
  validateUser,
  qrController.generateQR.bind(qrController)
);

router.get(
  "/list",
  validateUser,
  qrController.getQRCodes.bind(qrController)
);

router.get(
  "/master/:qrMasterId",
  validateUser,
  qrController.getQRMaster.bind(qrController)
);

router.get(
  "/analytics/:qrMasterId",
  validateUser,
  qrController.getQRAnalytics.bind(qrController)
);

router.get(
  "/download/:qrMasterId",
  validateUser,
  qrController.downloadQR.bind(qrController)
);

router.put(
  "/configure/:qrMasterId",
  validateUser,
  qrController.updateQRConfiguration.bind(qrController)
);

router.delete(
  "/master/:qrMasterId",
  validateUser,
  qrController.deleteQRMaster.bind(qrController)
);

// Parameterized routes must come last
router.get(
  "/:qrId",
  validateUser,
  qrController.getQRCode.bind(qrController)
);

router.delete(
  "/:qrId",
  validateUser,
  qrController.deleteQRCode.bind(qrController)
);

// Public scan tracking route
router.get(
  "/scan/:token",
  qrController.trackScan.bind(qrController)
);

// Public QR data endpoint (for scan page)
router.get(
  "/data/:token",
  qrController.getQRDataByToken.bind(qrController)
);

// Public feedback submission from QR
router.post(
  "/feedback",
  qrController.submitFeedback.bind(qrController)
);

module.exports = router;
