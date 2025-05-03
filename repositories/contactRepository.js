
const {Contact,Phonebook} =  require("../models");

class ContactRepository {
  async getPhonebooksByUid(uid) {
    return await Phonebook.findAll({ where: { uid } });
  }

  async findByMobileAndUid(mobile, uid) {
    return await Contact.findOne({ where: { mobile, uid } });
  }

  async findById(id) {
    return await Contact.findOne({ where: { id } });
  }

  async create(contactData) {
    return await Contact.create(contactData);
  }

  async bulkCreate(contacts) {
    return await Contact.bulkCreate(contacts);
  }

  async findByUid(uid) {
    return await Contact.findAll({ where: { uid } });
  }

  async deleteByPhonebookId(phonebook_id, uid) {
    return await Contact.destroy({ where: { phonebook_id, uid } });
  }

  async deleteByIds(ids) {
    return await Contact.destroy({ where: { id: ids } });
  }

  async findByPhonebookId(phonebook_id, uid) {
    return await Contact.findAll({ where: { phonebook_id, uid } });
  }

  async delete(id) {
    return await Contact.destroy({ where: { id } });
  }

  async countByUid(uid) {
    return await Contact.count({ where: { uid } });
  }
}

module.exports = new ContactRepository();