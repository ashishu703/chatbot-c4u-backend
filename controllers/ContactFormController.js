const UidRequiredException = require("../exceptions/CustomExceptions/UidRequiredException");
const ContactFormService = require("../services/ContactFormService");
const {formSuccess} = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
class ContactFormController {
  contactFormService;

  constructor() {
    this.contactFormService = new ContactFormService();
  }

  async getContactLeads(req, res, next) {
    try {
      const query = req.query;
      const uid = req.user.uid;  
      if (!uid) {
        throw new UidRequiredException();
      }
      const leads = await this.contactFormService.getContactLeads({
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
      await this.contactFormService.deleteContactEntry(id);
      return formSuccess(res,{ msg: __t("entry_was_deleted"),

       });
    } catch (err) {
      next(err);
    }
  }

  async submitContactForm(req, res, next) {
    try {
      await this.contactFormService.submitContactForm(req.body);
      return formSuccess(res,{ msg: __t("form_submitted"),
        
       });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactFormController;
