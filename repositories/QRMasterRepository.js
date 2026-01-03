const { QRMaster } = require("../models");
const Repository = require("./Repository");

class QRMasterRepository extends Repository {
  constructor() {
    super(QRMaster);
  }

  async createQRMaster(data) {
    return this.create(data);
  }

  async getQRMastersByUid(uid, query = {}) {
    return this.paginate({
      ...query,
      where: { uid },
      include: ["qrCodes"],
      order: [["createdAt", "DESC"]],
    });
  }

  async getQRMasterById(qrMasterId, relations = []) {
    return this.findFirst(
      {
        where: { qr_master_id: qrMasterId },
      },
      relations
    );
  }

  async updateQRMaster(qrMasterId, data) {
    return this.update(data, { qr_master_id: qrMasterId });
  }

  async deleteQRMaster(qrMasterId) {
    return this.delete({ qr_master_id: qrMasterId });
  }

  async incrementScanCount(qrMasterId) {
    const qrMaster = await this.model.findOne({
      where: { qr_master_id: qrMasterId },
    });
    if (qrMaster) {
      qrMaster.total_scans += 1;
      await qrMaster.save();
      return qrMaster.toJSON();
    }
    return null;
  }
}

module.exports = QRMasterRepository;
