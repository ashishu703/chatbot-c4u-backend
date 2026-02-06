const PhonebookRepository = require("../repositories/PhonebookRepository");
const ContactRepository = require("../repositories/ContactRepository");
const {
  parseCSVFile,
  areMobileNumbersFilled,
  hasValidCountryCode,
  normalizeImportRow,
  toExportCSV,
  toExportJSON,
} = require("../utils/phonebook.utils");
const DuplicatePhonebookNameException = require("../exceptions/CustomExceptions/DuplicatePhonebookNameException");
const InvalidCsvProvidedException = require("../exceptions/CustomExceptions/InvalidCsvProvidedException");
const CsvMobileMissingException = require("../exceptions/CustomExceptions/CsvMobileMissingException");
const CsvCountryCodeRequiredException = require("../exceptions/CustomExceptions/CsvCountryCodeRequiredException");
const kafkaManager = require("../utils/kafka/kafka-manager.utils");

const CONTACTS_TOPIC = "contacts";

class PhonebookService {
  constructor() {
    this.phonebookRepository = new PhonebookRepository();
    this.contactRepository = new ContactRepository();
  }

  async addPhonebook(uid, name) {
    const existing = await this.phonebookRepository.findByUidAndName(uid, name);
    if (existing) throw new DuplicatePhonebookNameException();
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
    const csvData = parseCSVFile(fileData);
    if (!csvData || csvData.length === 0) throw new InvalidCsvProvidedException();

    const normalized = csvData.map(normalizeImportRow).filter(Boolean);
    if (normalized.length === 0) throw new CsvMobileMissingException();
    if (!areMobileNumbersFilled(csvData)) throw new CsvMobileMissingException();
    if (!hasValidCountryCode(csvData)) throw new CsvCountryCodeRequiredException();

    const contacts = normalized.map((item) => ({
      uid,
      name: item.name,
      mobile: item.mobile,
    }));

    const created = await this.contactRepository.bulkCreate(contacts);
    await this.publishContactsToKafka(created, "import", uid);
    return true;
  }

  async addSingleContact(uid, contact) {
    const created = await this.contactRepository.create({
      uid,
      name: contact.name,
      mobile: contact.mobile,
    });
    await this.publishContactsToKafka([created], "add", uid);
    return true;
  }

  async updateContact(uid, contactId, data) {
    const contact = await this.contactRepository.findFirst({ where: { id: contactId, uid } });
    if (!contact) throw new Error("Contact not found");
    await this.contactRepository.update(
      { name: data.name, mobile: data.mobile },
      { id: contactId, uid }
    );
    return true;
  }

  async getContacts(query) {
    return await this.contactRepository.paginate(query);
  }

  async getAllContactsForExport(uid) {
    const result = await this.contactRepository.find({ where: { uid } });
    return Array.isArray(result) ? result : [];
  }

  async exportContacts(uid, format = "csv") {
    const contacts = await this.getAllContactsForExport(uid);
    const phonebooks = await this.phonebookRepository.findByUid(uid);
    const phonebookMap = {};
    (phonebooks || []).forEach((p) => {
      phonebookMap[p.id] = p.name;
    });
    if (format === "json") {
      return { data: toExportJSON(contacts, phonebookMap), contentType: "application/json", ext: "json" };
    }
    return { data: toExportCSV(contacts, phonebookMap), contentType: "text/csv", ext: "csv" };
  }

  async deleteContacts(ids) {
    await this.contactRepository.deleteByIds(ids);
    return true;
  }

  async reassignContactsToPhonebook(uid, contactIds, newPhonebookId) {
    const phonebook = await this.phonebookRepository.findById(newPhonebookId);
    if (!phonebook || phonebook.uid !== uid) {
      throw new Error("Invalid Tag or Tag does not belong to user");
    }
    const contacts = await this.contactRepository.find({
      where: { id: contactIds, uid },
    });
    if (contacts.length !== contactIds.length) {
      throw new Error("Some contacts do not belong to user or do not exist");
    }
    return { updatedContacts: contactIds.length, newPhonebookId, newPhonebookName: phonebook.name };
  }

  async publishContactsToKafka(contacts, eventType, uid) {
    try {
      if (!kafkaManager.isConnected) return;
      for (const c of contacts) {
        await kafkaManager.sendMessage(CONTACTS_TOPIC, {
          event: eventType,
          uid,
          contact: { id: c.id, name: c.name, mobile: c.mobile, source: c.source },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Kafka contact publish error:", err);
    }
  }
}

module.exports = PhonebookService;
