const ContactFormRepository = require("../repositories/ContactFormRepository");
const { validateEmail } = require("../utils/validation.utils");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidEmailIdException = require("../exceptions/CustomExceptions/InvalidEmailIdException");
const IdRequiredException = require("../exceptions/CustomExceptions/IdRequiredException");
const kafkaManager = require("../utils/kafka/kafka-manager.utils");

class ContactFormService {
  constructor() {
    this.contactFormRepository = new ContactFormRepository();
  }

  async submitContactForm({ name, mobile, email, content }) {
    if (!name || !mobile || !email || !content) throw new FillAllFieldsException();
    if (!validateEmail(email)) throw new InvalidEmailIdException();
    const lead = await this.contactFormRepository.create({ email, name, mobile, content });
    try {
      if (kafkaManager.isConnected) {
        await kafkaManager.sendMessage("contact-leads", {
          id: lead.id,
          name,
          mobile,
          email,
          content,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Kafka contact-lead publish error:", err);
    }
    return lead;
  }
  async getContactLeads(query) {
    return await this.contactFormRepository.paginate(query);
  }

  async deleteContactEntry(id) {
    if (!id) throw new IdRequiredException();
    return await this.contactFormRepository.delete({ id });
  }
}

module.exports = ContactFormService;
