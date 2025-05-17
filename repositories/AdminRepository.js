const { Admin } = require("../models");

class AdminRepository {
  async findByEmail(email) {
    return await Admin.findOne({ where: { email } });
  }
  async findFirst() {
    return await Admin.findOne();
  }

  async findById(uid) {
    return await Admin.findOne({ where: { uid } });
  }

  async updateAdmin(uid, email, newpass) {
    const updateData = { email };
    if (newpass) {
      updateData.password = await require("bcrypt").hash(newpass, 10);
    }
    await Admin.update(updateData, { where: { uid } });
  }

  async updatePassword(email, password) {
    await Admin.update({ password }, { where: { email } });
  }
}

module.exports = AdminRepository;
