const { QRScanLog } = require("../models");
const Repository = require("./Repository");

class QRScanLogRepository extends Repository {
  constructor() {
    super(QRScanLog);
  }

  async createScanLog(data) {
    return this.create(data);
  }

  async getScanLogsByQRMaster(qrMasterId, query = {}) {
    return this.paginate({
      ...query,
      where: { qr_master_id: qrMasterId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getScanLogsByToken(uniqueToken, query = {}) {
    return this.find({
      where: { unique_token: uniqueToken },
      ...query,
      order: [["createdAt", "DESC"]],
    });
  }

  async getScanCountByQRMaster(qrMasterId) {
    return this.count({ where: { qr_master_id: qrMasterId } });
  }

  async getScanCountByToken(uniqueToken) {
    return this.count({ where: { unique_token: uniqueToken } });
  }
}

module.exports = QRScanLogRepository;
