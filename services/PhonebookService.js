const PhonebookRepository = require("../repositories/phonebookRepository");
const ContactRepository = require("../repositories/ContactRepository");
const {
  parseCSVFile,
  areMobileNumbersFilled,
} = require("../functions/function");
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

  async getPhonebooks(uid) {
    return await this.phonebookRepository.findByUid(uid);
  }

  async deletePhonebook(uid, id) {
    await this.phonebookRepository.delete(id);
    await this.contactRepository.deleteByPhonebookId(id, uid);
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
      phonebook_name,
      name: item.name,
      mobile: item.mobile,
      var1: item.var1,
      var2: item.var2,
      var3: item.var3,
      var4: item.var4,
      var5: item.var5,
    }));

    await this.contactRepository.bulkCreate(contacts);
    return true;
  }

  async addSingleContact(uid, contact) {
    await this.contactRepository.create({ ...contact, uid });
    return true;
  }

  async getContacts(uid) {
    return await this.contactRepository.findByUid(uid);
  }

  async deleteContacts(ids) {
    await this.contactRepository.deleteByIds(ids);
    return true;
  }
}

module.exports = PhonebookService;
