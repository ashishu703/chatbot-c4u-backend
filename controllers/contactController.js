const UidRequiredException = require("../exceptions/CustomExceptions/UidRequiredException");
const ContactService = require("../services/ContactService");
const {formSuccess} = require("../utils/response.utils");
class ContactController {
  contactService;

  constructor() {
    this.contactService = new ContactService();
  }

  async getContactLeads(req, res, next) {
    try {
      const uid = req.user.uid;  
      if (!uid) {
        throw new UidRequiredException();
      }
      const leads = await this.contactService.getContactLeads(uid);
      return formSuccess({ data: leads });
    } catch (err) {
      next(err);
    }
  }

  async deleteContactEntry(req, res, next) {
    try {
      const { id } = req.body;
      if (!id) {
        throw new UidRequiredException();
      }
      await this.contactService.deleteContactEntry(id);
      return formSuccess({ msg: "Entry was deleted" });
    } catch (err) {
      next(err);
    }
  }

  async submitContactForm(req, res, next) {
    try {
      await this.contactService.submitContactForm(req.body);
      return formSuccess({ msg: 'Your form has been submitted. We will contact you asap' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactController;
