const contactRepository = require('../repositories/contactRepository');
const { validateEmail } = require('../utils/validation');

class ContactService {
  async submitContactForm({ name, mobile, email, content }) {
    if (!name || !mobile || !email || !content) {
      throw new Error('Please fill all the fields');
    }
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email id');
    }
    return await contactRepository.create({ email, name, mobile, content });
  }
  async getContactLeads(uid) {
    if (!uid) {
      throw new Error("UID is missing");
    }
    return await contactRepository.findByUid(uid);
  }

  async deleteContactEntry(id) {
    if (!id) {
      throw new Error("ID is missing");
    }
    return await contactRepository.delete(id);
  }
}

module.exports = ContactService;
