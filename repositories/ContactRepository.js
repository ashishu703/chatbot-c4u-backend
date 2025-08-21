const { Contact } = require("../models");
const Repository = require("./Repository");

class ContactRepository extends Repository {
  constructor() {
    super(Contact);
  }

  async findByMobileAndUid(mobile, uid) {
    return this.findFirst({ where: { mobile, uid } }); 
  }

  async findByUid(uid) {
    return this.find({ where: { uid } });
  }

  

  async deleteByIds(ids) {
    return this.delete({ id: ids });
  }

  

  async countByUid(uid) {
    return this.count({ where: { uid } });
  }
}

module.exports = ContactRepository;
