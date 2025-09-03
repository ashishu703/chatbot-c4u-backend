const PhonebookRepository = require("../repositories/PhonebookRepository");
const ContactRepository = require("../repositories/ContactRepository");
const {
  parseCSVFile,
  areMobileNumbersFilled,
} = require("../utils/phonebook.utils");
const DuplicatePhonebookNameException = require("../exceptions/CustomExceptions/DuplicatePhonebookNameException");
const InvalidCsvProvidedException = require("../exceptions/CustomExceptions/InvalidCsvProvidedException");
const CsvMobileMissingException = require("../exceptions/CustomExceptions/CsvMobileMissingException");

class PhonebookService {
  phonebookRepository;
  contactRepository;
  constructor() {
    this.phonebookRepository = new PhonebookRepository();
    this.contactRepository = new ContactRepository();
  }
  async addPhonebook(uid, name) {
    const existing = await this.phonebookRepository.findByUidAndName(uid, name);
    if (existing) {
      throw new DuplicatePhonebookNameException();
    }
    await this.phonebookRepository.create({ uid, name });
    return true;
  }

  async getPhonebooks(query) {
    return await this.phonebookRepository.paginate(query);
  }

async deletePhonebook(uid, id) {
  await this.phonebookRepository.delete({ id }); 
  return true;
}


  async importContacts(uid, phonebook_id, phonebook_name, fileData) {
    const csvData = await parseCSVFile(fileData);
    if (!csvData) {
      throw new InvalidCsvProvidedException();
    }
    if (!areMobileNumbersFilled(csvData)) {
      throw new CsvMobileMissingException();
    }

    const contacts = csvData.map((item) => ({
      uid,
      phonebook_id,
      name: item.name,
      mobile: item.mobile,
      source: 'csv_import'
    }));

    await this.contactRepository.bulkCreate(contacts);
    return true;
  }

  async addSingleContact(uid, contact) {
    await this.contactRepository.create({ 
      ...contact, 
      uid,
      source: contact.source || 'manual'
    });
    return true;
  }

  async getContacts(query) {
    return await this.contactRepository.paginate(query);
  }

  async deleteContacts(ids) {
    await this.contactRepository.deleteByIds(ids);
    return true;
  }

  async reassignContactsToPhonebook(uid, contactIds, newPhonebookId) {
    const phonebook = await this.phonebookRepository.findById(newPhonebookId);
    if (!phonebook || phonebook.uid !== uid) {
      throw new Error('Invalid Tag or Tag does not belong to user');
    }
    const contacts = await this.contactRepository.find({
      where: { 
        id: contactIds,
        uid: uid 
      }
    });

    if (contacts.length !== contactIds.length) {
      throw new Error('Some contacts do not belong to user or do not exist');
    }

    await this.contactRepository.update(
      { phonebook_id: newPhonebookId },
      { 
        id: contactIds,
        uid: uid
      }
    );
    return {
      updatedContacts: contactIds.length,
      newPhonebookId,
      newPhonebookName: phonebook.name
    };
  }
}

module.exports = PhonebookService;
