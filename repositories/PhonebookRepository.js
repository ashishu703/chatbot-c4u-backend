const { Phonebook } = require("../models");
const Repository = require("./Repository");

class PhonebookRepository extends Repository {
  constructor() {
    super(Phonebook);
  }
  async findByUidAndName(uid, name) {
    return this.findFirst({ where: { uid, name } });
  }

  async findByUid(uid) {
    return this.find({ where: { uid } });
  }

}

module.exports = PhonebookRepository;
