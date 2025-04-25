
const PhonebookRepository = require('../repositories/phonebookRepository');
const ContactRepository = require('../repositories/contactRepository');
const { parseCSVFile, areMobileNumbersFilled } = require('../functions/function');

class PhonebookService {
  async addPhonebook(uid, name) {
    const existing = await PhonebookRepository.findByUidAndName(uid, name);
    if (existing) {
      throw new Error('Duplicate phonebook name found');
    }
    await PhonebookRepository.create({ uid, name });
    return { success: true, msg: 'Phonebook was added' };
  }

  async getPhonebooks(uid) {
    return await PhonebookRepository.findByUid(uid);
  }

  async deletePhonebook(uid, id) {
    await PhonebookRepository.delete(id);
    await ContactRepository.deleteByPhonebookId(id, uid);
    return { success: true, msg: 'Phonebook was deleted' };
  }

  async importContacts(uid, phonebook_id, phonebook_name, fileData) {
    const csvData = await parseCSVFile(fileData);
    if (!csvData) {
      throw new Error('Invalid CSV provided');
    }
    if (!areMobileNumbersFilled(csvData)) {
      throw new Error('Please check your CSV, one or more mobile numbers not filled');
    }

    const contacts = csvData.map((item) => ({
      uid,
      phonebook_id,
      phonebook_name,
      name: item.name,
      mobile: item.mobile,
      var1: item.var1,
      var2: item.var2,
      var3: item.var3,
      var4: item.var4,
      var5: item.var5,
    }));

    await ContactRepository.bulkCreate(contacts);
    return { success: true, msg: 'Contacts were inserted' };
  }

  async addSingleContact(uid, contact) {
    await ContactRepository.create({ ...contact, uid });
    return { success: true, msg: 'Contact was inserted' };
  }

  async getContacts(uid) {
    return await ContactRepository.findByUid(uid);
  }

  async deleteContacts(ids) {
    await ContactRepository.deleteByIds(ids);
    return { success: true, msg: 'Contact(s) were deleted' };
  }
}

module.exports = new PhonebookService();