const FaqRepository = require("../repositories/faqRepository");
const {formSuccess} = require("../utils/response.utils");
const{ __t } = require("../utils/locale.utils")
class FaqController {
  faqRepository;
  constructor(){
    this.faqRepository = new FaqRepository();
  }
   async addFaq(req, res, next) {
    try {
      const { question, answer } = req.body;
      await this.faqRepository.addFaq(question, answer);
      return formSuccess({ msg:__t("faq_was_added"),

       });
    } catch (err) {
      next(err);
    }
  }

   async getFaqs(req, res, next) {
    try {
      const faqs = await this.faqRepository.getFaqs();
      return formSuccess({ data: faqs });
    } catch (err) {
     next(err);
    }
  }

   async deleteFaq(req, res, next) {
    try {
      const { id } = req.body;
      await this.faqRepository.deleteFaq(id);
      return formSuccess({ msg: __t("faq_was_deleted"),
        
      });
    } catch (err) {
     next(err);
    }
  }
}

module.exports = FaqController;