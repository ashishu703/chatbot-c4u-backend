const QRService = require("../services/QRService");
const { GoogleReview, QRCodes, User } = require("../models");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { formSuccess, formError } = require("../utils/response.utils");
const { isSingleQRPurpose } = require("../utils/qr.utils");
const fs = require("fs");

class QRController {
  constructor() {
    this.qrService = new QRService();
  }

  /**
   * Submit feedback from QR code scan
   * POST /api/qr/feedback
   */
  async submitFeedback(req, res, next) {
    try {
      const { token, rating, comment, isInternal } = req.body;

      if (!token || !rating) {
        return formError(res, "Token and rating are required");
      }

      // Find the QR code to get the owner (userId)
      const qrCode = await QRCodes.findOne({ where: { unique_token: token } });
      if (!qrCode) {
        return formError(res, "Invalid QR code", 404);
      }

      // Find the user by uid
      const user = await User.findOne({ where: { uid: qrCode.uid } });
      if (!user) {
        return formError(res, "User not found", 404);
      }

      // Create a "review" entry
      const reviewId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      await GoogleReview.create({
        userId: user.id,
        reviewId,
        reviewerName: "Guest (via QR)",
        rating,
        comment,
        isPositive: rating >= 4,
        reviewTime: new Date(),
        source: isInternal ? "internal_qr" : "google_redirect",
        reviewStatus: rating >= 4 ? "resolved" : "new",
      });

      return formSuccess(res, { msg: "Feedback submitted successfully" });
    } catch (err) {
      next(err);
    }
  }

  _validatePurpose(purpose) {
    const validPurposes = [
      "appointment_booking",
      "review_feedback",
      "product_original_check",
      "loyalty_rewards",
      "inventory_warehouse",
      "digital_menu_catalogue",
      "event_attendance_access",
      "payments_invoice",
      "lead_capture_crm",
      "marketing_campaign",
    ];

    if (!purpose || !validPurposes.includes(purpose)) {
      throw new InvalidRequestException("Invalid QR purpose");
    }
  }

  _validateQuantity(purpose, quantity) {
    if (isSingleQRPurpose(purpose)) {
      return 1; // Force quantity to 1 for single QR purposes
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 10000) {
      throw new InvalidRequestException("Quantity must be between 1 and 10000");
    }

    return qty;
  }

  async _handleRequest(handler, req, res, next) {
    try {
      return await handler(req, res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Generate QR codes
   * POST /api/user/qr/generate
   */
  async generateQR(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const user = req.decode;
      const { purpose, quantity = 1, metadata = {} } = req.body;

      this._validatePurpose(purpose);
      const finalQuantity = this._validateQuantity(purpose, quantity);

      const result = await this.qrService.generateQRCodes(
        user.uid,
        purpose,
        finalQuantity,
        metadata
      );

      return formSuccess(res, {
        msg: "QR codes generated successfully",
        data: result,
      });
    }, req, res, next);
  }

  /**
   * Get user's QR codes
   * GET /api/user/qr/list
   */
  async getQRCodes(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const user = req.decode;
      const qrCodes = await this.qrService.getQRCodesByUser(user.uid, req.query);

      return formSuccess(res, qrCodes);
    }, req, res, next);
  }

  /**
   * Get QR code by ID
   * GET /api/user/qr/:qrId
   */
  async getQRCode(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrId } = req.params;
      const user = req.decode;

      if (!qrId) {
        throw new FillAllFieldsException("QR ID is required");
      }

      const qrCode = await this.qrService.getQRCodeById(qrId, user.uid);

      return formSuccess(res, { qrCode });
    }, req, res, next);
  }

  /**
   * Get QR Master by ID
   * GET /api/user/qr/master/:qrMasterId
   */
  async getQRMaster(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrMasterId } = req.params;
      const user = req.decode;

      if (!qrMasterId) {
        throw new FillAllFieldsException("QR Master ID is required");
      }

      const qrMaster = await this.qrService.getQRMasterById(qrMasterId, user.uid);

      return formSuccess(res, { qrMaster });
    }, req, res, next);
  }

  /**
   * Get QR analytics
   * GET /api/user/qr/analytics/:qrMasterId
   */
  async getQRAnalytics(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrMasterId } = req.params;
      const user = req.decode;

      if (!qrMasterId) {
        throw new FillAllFieldsException("QR Master ID is required");
      }

      const analytics = await this.qrService.getQRAnalytics(qrMasterId, user.uid);

      return formSuccess(res, { analytics });
    }, req, res, next);
  }

  /**
   * Delete QR code
   * DELETE /api/user/qr/:qrId
   */
  async deleteQRCode(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrId } = req.params;
      const user = req.decode;

      if (!qrId) {
        throw new FillAllFieldsException("QR ID is required");
      }

      await this.qrService.deleteQRCode(qrId, user.uid);

      return formSuccess(res, { msg: "QR code deleted successfully" });
    }, req, res, next);
  }

  /**
   * Delete QR Master
   * DELETE /api/user/qr/master/:qrMasterId
   */
  async deleteQRMaster(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrMasterId } = req.params;
      const user = req.decode;

      if (!qrMasterId) {
        throw new FillAllFieldsException("QR Master ID is required");
      }

      await this.qrService.deleteQRMaster(qrMasterId, user.uid);

      return formSuccess(res, { msg: "QR Master deleted successfully" });
    }, req, res, next);
  }

  /**
   * Download QR codes (ZIP or single image)
   * GET /api/user/qr/download/:qrMasterId
   */
  async downloadQR(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrMasterId } = req.params;
      const { format = "zip" } = req.query;
      const user = req.decode;

      if (!qrMasterId) {
        throw new FillAllFieldsException("QR Master ID is required");
      }

      const downloadPackage = await this.qrService.generateDownloadPackage(
        qrMasterId,
        user.uid,
        format
      );

      if (downloadPackage.type === "single") {
        // Return single QR code as JSON with base64 image
        return formSuccess(res, {
          type: "single",
          qrImage: downloadPackage.qrImage,
          qrUrl: downloadPackage.qrUrl,
          purpose: downloadPackage.purpose,
        });
      } else {
        // Send ZIP file
        res.download(downloadPackage.filePath, downloadPackage.fileName, (err) => {
          if (err) {
            console.error("Error downloading file:", err);
          }
          // Clean up temp file
          if (fs.existsSync(downloadPackage.filePath)) {
            fs.unlinkSync(downloadPackage.filePath);
          }
        });
      }
    }, req, res, next);
  }

  /**
   * Track QR code scan (public endpoint)
   * GET /api/qr/scan/:token
   */
  async trackScan(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { token } = req.params;

      if (!token) {
        throw new FillAllFieldsException("Token is required");
      }

      const scanResult = await this.qrService.trackScan(token);

      return formSuccess(res, {
        msg: "Scan tracked successfully",
        data: scanResult,
      });
    }, req, res, next);
  }

  /**
   * Get QR data by token (for scan page - public endpoint)
   * GET /api/qr/data/:token
   */
  async getQRDataByToken(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { token } = req.params;

      if (!token) {
        throw new FillAllFieldsException("Token is required");
      }

      const qrData = await this.qrService.getQRDataByToken(token);

      // Track scan with device details
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("user-agent");
      
      // Basic device detection
      let deviceType = "unknown";
      if (userAgent) {
        if (/mobile|android|iphone|ipad/i.test(userAgent)) {
          deviceType = "mobile";
        } else if (/tablet|ipad/i.test(userAgent)) {
          deviceType = "tablet";
        } else {
          deviceType = "desktop";
        }
      }

      try {
        await this.qrService.trackScanWithDetails(token, {
          ip_address: ipAddress,
          user_agent: userAgent,
          device_type: deviceType,
        });
      } catch (err) {
        console.error("Error tracking scan:", err);
        // Don't fail the request if tracking fails
      }

      return formSuccess(res, {
        data: qrData,
      });
    }, req, res, next);
  }

  /**
   * Update QR configuration/metadata
   * PUT /api/user/qr/configure/:qrMasterId
   */
  async updateQRConfiguration(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { qrMasterId } = req.params;
      const { configuration } = req.body;
      const user = req.decode;

      if (!qrMasterId) {
        throw new FillAllFieldsException("QR Master ID is required");
      }

      if (!configuration || typeof configuration !== "object") {
        throw new InvalidRequestException("Configuration object is required");
      }

      const updatedQR = await this.qrService.updateQRConfiguration(
        qrMasterId,
        user.uid,
        configuration
      );

      return formSuccess(res, {
        msg: "QR configuration updated successfully",
        data: updatedQR,
      });
    }, req, res, next);
  }
}

module.exports = QRController;
