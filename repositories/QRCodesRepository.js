const { QRCodes } = require("../models");
const Repository = require("./Repository");

class QRCodesRepository extends Repository {
  constructor() {
    super(QRCodes);
  }

  async createQRCodes(dataArray) {
    return this.bulkCreate(dataArray);
  }

  async createQRCode(data) {
    return this.create(data);
  }

  async getQRCodesByMasterId(qrMasterId, query = {}) {
    return this.paginate({
      ...query,
      where: { qr_master_id: qrMasterId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getQRCodesByUid(uid, query = {}) {
    return this.paginate({
      ...query,
      where: { uid },
      order: [["createdAt", "DESC"]],
    });
  }

  async getQRCodeById(qrId, relations = []) {
    return this.findFirst(
      {
        where: { qr_id: qrId },
      },
      relations
    );
  }

  async getQRCodeByToken(uniqueToken) {
    return this.findFirst({
      where: { unique_token: uniqueToken },
    });
  }

  async updateQRCode(qrId, data) {
    return this.update(data, { qr_id: qrId });
  }

  async deleteQRCode(qrId) {
    return this.delete({ qr_id: qrId });
  }

  async deleteQRCodesByMasterId(qrMasterId) {
    return this.delete({ qr_master_id: qrMasterId });
  }

  async incrementScanCount(qrId) {
    const qrCode = await this.model.findOne({
      where: { qr_id: qrId },
    });
    if (qrCode) {
      qrCode.scan_count += 1;
      await qrCode.save();
      return qrCode.toJSON();
    }
    return null;
  }

  async getQRCodesByStatus(status, uid = null) {
    const where = { status };
    if (uid) {
      where.uid = uid;
    }
    return this.find({ where });
  }
}

module.exports = QRCodesRepository;
