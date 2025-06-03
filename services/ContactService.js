const ContactRepository = require("../repositories/ContactRepository");
const { validateEmail } = require("../utils/validation");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidEmailIdException = require("../exceptions/CustomExceptions/InvalidEmailIdException");
const UidRequiredException = require("../exceptions/CustomExceptions/UidRequiredException");
const IdRequiredException = require("../exceptions/CustomExceptions/IdRequiredException");
class ContactService {

  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async submitContactForm({ name, mobile, email, content }) {
    if (!name || !mobile || !email || !content) {
      throw new FillAllFieldsException();
    }
    if (!validateEmail(email)) {
      throw new InvalidEmailIdException();
    }
    return await this.contactRepository.create({ email, name, mobile, content });
  }
  async getContactLeads(uid) {
    if (!uid) {
      throw new UidRequiredException();
    }
    return await this.contactRepository.findByUid(uid);
  }

  async deleteContactEntry(id) {
    if (!id) {
      throw new IdRequiredException();
    }
    return await this.contactRepository.delete(id);
  }
}

module.exports = ContactService;
