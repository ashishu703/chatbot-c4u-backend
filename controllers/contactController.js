const ContactService = require("../services/ContactService");

class ContactController {
  contactService;

  constructor() {
    this.contactService = new ContactService();
  }

  async getContactLeads(req, res) {
    try {
      const uid = req.user.uid;  
      if (!uid) {
        return res.json({ success: false, msg: "UID is missing" });
      }
      const leads = await this.contactService.getContactLeads(uid);
      res.json({ data: leads, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error", err });
    }
  }

  async deleteContactEntry(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.json({ success: false, msg: "ID is required" });
      }
      await this.contactService.deleteContactEntry(id);
      res.json({ success: true, msg: "Entry was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error", err });
    }
  }

  async submitContactForm(req, res) {
    try {
      await this.contactService.submitContactForm(req.body);
      res.json({ success: true, msg: 'Your form has been submitted. We will contact you asap' });
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }
}

module.exports = ContactController;
