const QRCode = require("qrcode");
const randomstring = require("randomstring");
const { backendURI } = require("../config/app.config");
const path = require("path");
const fs = require("fs");

/**
 * QR Purpose Configuration
 * Defines which purposes require single vs unique QR codes
 */
const QR_PURPOSE_CONFIG = {
  // Single QR purposes (quantity = 1, disabled)
  single: [
    "appointment_booking",
    "review_feedback",
    "digital_menu_catalogue",
    "lead_capture_crm",
    "payments_invoice", // Static UPI Payment
  ],
  // Unique QR purposes (quantity enabled)
  unique: [
    "product_original_check",
    "loyalty_rewards",
    "inventory_warehouse",
    "event_attendance_access",
    "payments_invoice", // Dynamic invoice with amount + invoice id
    "marketing_campaign", // Advanced marketing with user-level tracking
  ],
};

/**
 * Check if a purpose requires single QR code
 */
function isSingleQRPurpose(purpose) {
  return QR_PURPOSE_CONFIG.single.includes(purpose);
}

/**
 * Check if a purpose requires unique QR codes
 */
function isUniqueQRPurpose(purpose) {
  return QR_PURPOSE_CONFIG.unique.includes(purpose);
}

/**
 * Generate unique token for QR code
 */
function generateUniqueToken() {
  return randomstring.generate({
    length: 32,
    charset: "alphanumeric",
  });
}

/**
 * Generate QR master ID
 */
function generateQRMasterId() {
  return `qrm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate QR code ID
 */
function generateQRId() {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate QR code URL based on purpose and token
 * Uses frontend URL for dynamic scan page
 */
function generateQRUrl(purpose, uniqueToken = null, frontendUrl = null) {
  const base = frontendUrl || process.env.FRONTENDURI || "https://qr.mysaas.com";
  if (uniqueToken) {
    return `${base}/q/${uniqueToken}`;
  }
  // For single QR, we still need a token - generate one from purpose + timestamp
  const singleToken = `${purpose}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `${base}/q/${singleToken}`;
}

/**
 * Generate QR code image as base64 or save to file
 */
async function generateQRCodeImage(data, options = {}) {
  const {
    errorCorrectionLevel = "M",
    type = "png",
    quality = 0.92,
    margin = 1,
    color = { dark: "#000000", light: "#FFFFFF" },
    width = 300,
  } = options;

  try {
    // Generate QR code as data URL (base64)
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel,
      type,
      quality,
      margin,
      color,
      width,
    });

    return qrDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate QR code and save to file system
 */
async function generateQRCodeFile(data, filePath, options = {}) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate and save QR code
    await QRCode.toFile(filePath, data, options);

    return filePath;
  } catch (error) {
    throw new Error(`Failed to generate QR code file: ${error.message}`);
  }
}

/**
 * Get QR purpose display name
 */
function getQRPurposeDisplayName(purpose) {
  const purposeNames = {
    appointment_booking: "Appointment / Booking QR",
    review_feedback: "Review & Feedback QR",
    product_original_check: "Product Original Check / Anti-Fake QR",
    loyalty_rewards: "Loyalty & Rewards QR",
    inventory_warehouse: "Inventory / Warehouse QR",
    digital_menu_catalogue: "Digital Menu / Catalogue QR",
    event_attendance_access: "Event / Attendance / Access QR",
    payments_invoice: "Payments & Invoice QR",
    lead_capture_crm: "Lead Capture & CRM QR",
    marketing_campaign: "Marketing Campaign / Smart QR",
  };
  return purposeNames[purpose] || purpose;
}

/**
 * Get helper text for QR purpose
 */
function getQRPurposeHelperText(purpose) {
  if (isSingleQRPurpose(purpose)) {
    return "This QR will be reused by all users";
  } else if (isUniqueQRPurpose(purpose)) {
    return "Each QR will be unique and trackable";
  }
  return "";
}

module.exports = {
  isSingleQRPurpose,
  isUniqueQRPurpose,
  generateUniqueToken,
  generateQRMasterId,
  generateQRId,
  generateQRUrl,
  generateQRCodeImage,
  generateQRCodeFile,
  getQRPurposeDisplayName,
  getQRPurposeHelperText,
  QR_PURPOSE_CONFIG,
};
