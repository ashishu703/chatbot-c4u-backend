const UidRequiredException = require("../exceptions/CustomExceptions/UidRequiredException");
const ContactService = require("../services/ContactService");
const {formSuccess} = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const { where } = require("sequelize");
class ContactController {
  contactService;

  constructor() {
    this.contactService = new ContactService();
  }

  async getContactLeads(req, res, next) {
    try {
      const query = req.query;
      const uid = req.user.uid;  
      if (!uid) {
        throw new UidRequiredException();
      }
      const leads = await this.contactService.getContactLeads({
        where: {
          uid: uid,
        },
        ...query
      });
      return formSuccess(res,{...leads });
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
      return formSuccess(res,{ msg: __t("entry_was_deleted"),

       });
    } catch (err) {
      next(err);
    }
  }

  async submitContactForm(req, res, next) {
    try {
      await this.contactService.submitContactForm(req.body);
      return formSuccess(res,{ msg: __t("form_submitted"),
        
       });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactController;
