const { ContactForm } = require("../models");
const Repository = require("./Repository");

class ContactFormRepository extends Repository {
  constructor() {
    super(ContactForm);
  }
}

module.exports = ContactFormRepository;