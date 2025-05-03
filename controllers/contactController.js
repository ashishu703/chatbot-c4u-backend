const ContactService = require("../services/contactService");

class ContactController {

  contactService;

  constructor() {
    this.contactService = new ContactService(); 
  }


   async getContactLeads(req, res) {
    try {
      const leads = await this.contactService.getContactLeads();
      res.json({ data: leads, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

   async deleteContactEntry(req, res) {
    try {
      const { id } = req.body;
      await this.contactService.deleteContactEntry(id);
      res.json({ success: true, msg: "Entry was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
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