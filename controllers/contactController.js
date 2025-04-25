const ContactRepository = require("../repositories/contactRepository");

class ContactController {
  static async getContactLeads(req, res) {
    try {
      const leads = await ContactRepository.getContactLeads();
      res.json({ data: leads, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static async deleteContactEntry(req, res) {
    try {
      const { id } = req.body;
      await ContactRepository.deleteContactEntry(id);
      res.json({ success: true, msg: "Entry was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static   async submitContactForm(req, res) {
    try {
      await contactService.submitContactForm(req.body);
      res.json({ success: true, msg: 'Your form has been submitted. We will contact you asap' });
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }

}

module.exports = ContactController;