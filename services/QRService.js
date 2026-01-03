const QRMasterRepository = require("../repositories/QRMasterRepository");
const QRCodesRepository = require("../repositories/QRCodesRepository");
const QRScanLogRepository = require("../repositories/QRScanLogRepository");
const {
  isSingleQRPurpose,
  isUniqueQRPurpose,
  generateUniqueToken,
  generateQRMasterId,
  generateQRId,
  generateQRUrl,
  generateQRCodeImage,
  getQRPurposeDisplayName,
} = require("../utils/qr.utils");
const { frontendURI } = require("../config/app.config");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

class QRService {
  constructor() {
    this.qrMasterRepository = new QRMasterRepository();
    this.qrCodesRepository = new QRCodesRepository();
    this.qrScanLogRepository = new QRScanLogRepository();
  }

  /**
   * Generate QR codes based on purpose and quantity
   */
  async generateQRCodes(uid, purpose, quantity = 1, metadata = {}) {
    // Validate purpose
    if (!purpose) {
      throw new Error("QR purpose is required");
    }

    // Determine QR type
    const isSingle = isSingleQRPurpose(purpose);
    const qrType = isSingle ? "single" : "unique";

    // Force quantity to 1 for single QR purposes
    const finalQuantity = isSingle ? 1 : Math.max(1, parseInt(quantity) || 1);

    if (isSingle) {
      return this._generateSingleQR(uid, purpose, metadata);
    } else {
      return this._generateUniqueQRCodes(uid, purpose, finalQuantity, metadata);
    }
  }

  /**
   * Generate single QR code (reusable)
   * For single QR, we still create a QRCode record with a token for scanning
   */
  async _generateSingleQR(uid, purpose, metadata) {
    const qrMasterId = generateQRMasterId();
    const uniqueToken = generateUniqueToken(); // Generate token even for single QR
    const qrId = generateQRId();
    const qrUrl = generateQRUrl(purpose, uniqueToken, frontendURI);

    // Generate QR code image
    const qrImageBase64 = await generateQRCodeImage(qrUrl);

    const qrMasterData = {
      qr_master_id: qrMasterId,
      uid,
      purpose,
      qr_type: "single",
      qr_url: qrUrl,
      qr_image_url: qrImageBase64,
      metadata: {
        ...metadata,
        unique_token: uniqueToken, // Store token in master for easy lookup
      },
      status: "active",
      total_scans: 0,
    };

    const qrMaster = await this.qrMasterRepository.createQRMaster(qrMasterData);

    // Create single QRCode record with token after master is created
    const qrCodeData = {
      qr_id: qrId,
      qr_master_id: qrMasterId,
      uid,
      purpose,
      unique_token: uniqueToken,
      qr_url: qrUrl,
      qr_image_url: qrImageBase64,
      status: "active",
      scan_count: 0,
      metadata: metadata || {},
    };

    const qrCode = await this.qrCodesRepository.createQRCode(qrCodeData);

    return {
      qrMaster,
      qrCodes: [qrCode],
      type: "single",
      count: 1,
    };
  }

  /**
   * Generate multiple unique QR codes
   */
  async _generateUniqueQRCodes(uid, purpose, quantity, metadata) {
    const qrMasterId = generateQRMasterId();
    const qrCodes = [];

    // Generate QR codes in batch
    for (let i = 0; i < quantity; i++) {
      const uniqueToken = generateUniqueToken();
      const qrId = generateQRId();
      const qrUrl = generateQRUrl(purpose, uniqueToken, frontendURI);

      // Generate QR code image
      const qrImageBase64 = await generateQRCodeImage(qrUrl);

      qrCodes.push({
        qr_id: qrId,
        qr_master_id: qrMasterId,
        uid,
        purpose,
        unique_token: uniqueToken,
        qr_url: qrUrl,
        qr_image_url: qrImageBase64,
        status: "active",
        scan_count: 0,
        metadata: {
          ...metadata,
          index: i + 1,
          total: quantity,
        },
      });
    }

    // Create QR Master record
    const qrMasterData = {
      qr_master_id: qrMasterId,
      uid,
      purpose,
      qr_type: "unique",
      qr_url: null, // No single URL for unique QRs
      qr_image_url: null,
      metadata: {
        ...metadata,
        quantity,
        generated_at: new Date().toISOString(),
      },
      status: "active",
      total_scans: 0,
    };

    const qrMaster = await this.qrMasterRepository.createQRMaster(qrMasterData);

    // Bulk create QR codes
    const createdQRCodes = await this.qrCodesRepository.createQRCodes(qrCodes);

    return {
      qrMaster,
      qrCodes: createdQRCodes,
      type: "unique",
      count: quantity,
    };
  }

  /**
   * Get QR codes by user
   */
  async getQRCodesByUser(uid, query = {}) {
    const qrMasters = await this.qrMasterRepository.getQRMastersByUid(uid, query);
    return qrMasters;
  }

  /**
   * Get QR code by ID
   */
  async getQRCodeById(qrId, uid = null) {
    const qrCode = await this.qrCodesRepository.getQRCodeById(qrId, ["qrMaster"]);

    if (!qrCode) {
      throw new Error("QR code not found");
    }

    if (uid && qrCode.uid !== uid) {
      throw new Error("Unauthorized access to QR code");
    }

    return qrCode;
  }

  /**
   * Get QR Master by ID
   */
  async getQRMasterById(qrMasterId, uid = null) {
    const qrMaster = await this.qrMasterRepository.getQRMasterById(qrMasterId, [
      "qrCodes",
    ]);

    if (!qrMaster) {
      throw new Error("QR Master not found");
    }

    if (uid && qrMaster.uid !== uid) {
      throw new Error("Unauthorized access to QR Master");
    }

    return qrMaster;
  }

  /**
   * Track QR code scan
   */
  async trackScan(uniqueToken) {
    const qrCode = await this.qrCodesRepository.getQRCodeByToken(uniqueToken);

    if (!qrCode) {
      // Check if it's a single QR master
      // For single QR, the token might be the purpose
      throw new Error("QR code not found");
    }

    if (qrCode.status !== "active") {
      throw new Error("QR code is not active");
    }

    // Increment scan count
    await this.qrCodesRepository.incrementScanCount(qrCode.qr_id);

    // Update QR Master scan count if exists
    if (qrCode.qr_master_id) {
      await this.qrMasterRepository.incrementScanCount(qrCode.qr_master_id);
    }

    return {
      ...qrCode,
      scan_count: qrCode.scan_count + 1,
    };
  }

  /**
   * Delete QR code
   */
  async deleteQRCode(qrId, uid) {
    const qrCode = await this.getQRCodeById(qrId, uid);
    await this.qrCodesRepository.deleteQRCode(qrId);
    return { success: true };
  }

  /**
   * Delete QR Master and all associated QR codes
   */
  async deleteQRMaster(qrMasterId, uid) {
    const qrMaster = await this.getQRMasterById(qrMasterId, uid);
    await this.qrMasterRepository.deleteQRMaster(qrMasterId);
    return { success: true };
  }

  /**
   * Get QR analytics
   */
  async getQRAnalytics(qrMasterId, uid) {
    const qrMaster = await this.getQRMasterById(qrMasterId, uid);
    const qrCodes = await this.qrCodesRepository.getQRCodesByMasterId(qrMasterId);

    const analytics = {
      qrMaster,
      totalQRCodes: qrCodes.data?.length || 0,
      totalScans: qrMaster.total_scans || 0,
      activeQRCodes: qrCodes.data?.filter((qr) => qr.status === "active").length || 0,
      usedQRCodes: qrCodes.data?.filter((qr) => qr.status === "used").length || 0,
      expiredQRCodes: qrCodes.data?.filter((qr) => qr.status === "expired").length || 0,
      scanBreakdown: qrCodes.data?.map((qr) => ({
        qr_id: qr.qr_id,
        scan_count: qr.scan_count,
        status: qr.status,
      })) || [],
    };

    return analytics;
  }

  /**
   * Generate download package (ZIP for bulk, PDF for single)
   */
  async generateDownloadPackage(qrMasterId, uid, format = "zip") {
    const qrMaster = await this.getQRMasterById(qrMasterId, uid);

    if (qrMaster.qr_type === "single") {
      return {
        type: "single",
        qrImage: qrMaster.qr_image_url,
        qrUrl: qrMaster.qr_url,
        purpose: getQRPurposeDisplayName(qrMaster.purpose),
      };
    } else {
      // Generate ZIP file with all QR codes
      const qrCodes = await this.qrCodesRepository.getQRCodesByMasterId(qrMasterId);

      // Create temporary directory
      const tempDir = path.join(__dirname, "../temp/qr_downloads");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const zipPath = path.join(tempDir, `${qrMasterId}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on("close", () => {
          resolve({
            type: "zip",
            filePath: zipPath,
            fileName: `qr_codes_${qrMasterId}.zip`,
            size: archive.pointer(),
          });
        });

        archive.on("error", (err) => reject(err));
        archive.pipe(output);

        // Add QR code images to ZIP
        qrCodes.data?.forEach((qrCode, index) => {
          if (qrCode.qr_image_url) {
            const imageBuffer = Buffer.from(
              qrCode.qr_image_url.split(",")[1],
              "base64"
            );
            archive.append(imageBuffer, {
              name: `qr_${index + 1}_${qrCode.unique_token.substring(0, 8)}.png`,
            });
          }
        });

        archive.finalize();
      });
    }
  }

  /**
   * Get QR data by token (for scan page)
   */
  async getQRDataByToken(token) {
    const qrCode = await this.qrCodesRepository.getQRCodeByToken(token);

    if (!qrCode) {
      throw new Error("QR code not found");
    }

    const qrMaster = await this.qrMasterRepository.getQRMasterById(
      qrCode.qr_master_id
    );

    if (!qrMaster || qrMaster.status !== "active") {
      throw new Error("QR code is not active");
    }

    return {
      qrCode,
      qrMaster,
      purpose: qrMaster.purpose,
      metadata: qrMaster.metadata || {},
      qrCodeMetadata: qrCode.metadata || {},
    };
  }

  /**
   * Update QR configuration/metadata
   */
  async updateQRConfiguration(qrMasterId, uid, configuration) {
    const qrMaster = await this.getQRMasterById(qrMasterId, uid);

    // Merge existing metadata with new configuration
    const updatedMetadata = {
      ...(qrMaster.metadata || {}),
      ...configuration,
      updated_at: new Date().toISOString(),
    };

    await this.qrMasterRepository.updateQRMaster(qrMasterId, {
      metadata: updatedMetadata,
    });

    return {
      ...qrMaster,
      metadata: updatedMetadata,
    };
  }

  /**
   * Track QR scan with device and location details
   */
  async trackScanWithDetails(token, scanDetails = {}) {
    const qrCode = await this.qrCodesRepository.getQRCodeByToken(token);

    if (!qrCode) {
      throw new Error("QR code not found");
    }

    if (qrCode.status !== "active") {
      throw new Error("QR code is not active");
    }

    // Create scan log
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scanLogData = {
      scan_id: scanId,
      qr_id: qrCode.qr_id,
      qr_master_id: qrCode.qr_master_id,
      unique_token: token,
      ip_address: scanDetails.ip_address || null,
      user_agent: scanDetails.user_agent || null,
      device_type: scanDetails.device_type || "unknown",
      browser: scanDetails.browser || null,
      os: scanDetails.os || null,
      country: scanDetails.country || null,
      city: scanDetails.city || null,
      latitude: scanDetails.latitude || null,
      longitude: scanDetails.longitude || null,
      scan_data: scanDetails.scan_data || {},
    };

    await this.qrScanLogRepository.createScanLog(scanLogData);

    // Increment scan counts
    await this.qrCodesRepository.incrementScanCount(qrCode.qr_id);
    await this.qrMasterRepository.incrementScanCount(qrCode.qr_master_id);

    return {
      scan_id: scanId,
      qr_code: qrCode,
      scan_count: qrCode.scan_count + 1,
    };
  }
}

module.exports = QRService;
