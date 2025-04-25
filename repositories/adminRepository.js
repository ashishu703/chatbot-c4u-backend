const { Admin } = require("../models/admin");

class AdminRepository {
  static async findByEmail(email) {
    return await Admin.findOne({ where: { email } });
  }
  static async findFirst(){ 
    return await Admin.findOne(); 
  }

  static async findById(uid) {
    return await Admin.findByPk(uid);
  }

  static async updateAdmin(uid, email, newpass) {
    const updateData = { email };
    if (newpass) {
      updateData.password = await require("bcrypt").hash(newpass, 10);
    }
    await Admin.update(updateData, { where: { uid } });
  }

  static async updatePassword(email, password) {
    await Admin.update({ password }, { where: { email } });
  }
}

module.exports = AdminRepository;