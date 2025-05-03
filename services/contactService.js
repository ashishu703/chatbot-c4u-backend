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
}

module.exports = ContactService;