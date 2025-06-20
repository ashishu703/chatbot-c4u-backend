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

  async deleteByPhonebookId(phonebook_id, uid) {
    return this.delete({ phonebook_id, uid });
  }

  async deleteByIds(ids) {
    return this.delete({ id: ids });
  }

  async findByPhonebookId(phonebook_id, uid) {
    return this.find({ where: { phonebook_id, uid } });
  }

  async countByUid(uid) {
    return this.count({ where: { uid } });
  }
}

module.exports = ContactRepository;
