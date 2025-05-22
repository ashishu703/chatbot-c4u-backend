const contactRepository = require("../repositories/contactRepository");
const { validateEmail } = require("../utils/validation");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidEmailIdException = require("../exceptions/CustomExceptions/InvalidEmailIdException");
const UidRequiredException = require("../exceptions/CustomExceptions/UidRequiredException");
const IdRequiredException = require("../exceptions/CustomExceptions/IdRequiredException");
class ContactService {
  async submitContactForm({ name, mobile, email, content }) {
    if (!name || !mobile || !email || !content) {
      throw new FillAllFieldsException();
    }
    if (!validateEmail(email)) {
      throw new InvalidEmailIdException();
    }
    return await contactRepository.create({ email, name, mobile, content });
  }
  async getContactLeads(uid) {
    if (!uid) {
      throw new UidRequiredException();
    }
    return await contactRepository.findByUid(uid);
  }

  async deleteContactEntry(id) {
    if (!id) {
      throw new IdRequiredException();
    }
    return await contactRepository.delete(id);
  }
}

module.exports = ContactService;
