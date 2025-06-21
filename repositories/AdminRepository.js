const { Admin } = require("../models");
const Repository = require("./Repository");

class AdminRepository extends Repository {

  constructor() {
    super(Admin);
  }

  async findByEmail(email) {
    return this.findFirst({ where: { email } });
  }

  async updateAdmin(uid, email, newpass) {
    const updateData = { email };
    if (newpass) {
      updateData.password = await require("bcrypt").hash(newpass, 10);
    }
    return this.update(updateData, { uid });
  }

  async updatePassword(email, password) {
    return this.update({ password }, { email });
  }


}

module.exports = AdminRepository;
