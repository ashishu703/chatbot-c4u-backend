const {Phonebook} = require('../models');

class PhonebookRepository {
  async findByUidAndName(uid, name) {
    return await Phonebook.findOne({ where: { uid, name } });
  }

  async findByUid(uid) {
    return await Phonebook.findAll({ where: { uid } });
  }

  async create(phonebookData) {
    return await Phonebook.create(phonebookData);
  }

  async delete(id) {
    return await Phonebook.destroy({ where: { id } });
  }
}

module.exports = new PhonebookRepository();