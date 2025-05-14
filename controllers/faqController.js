const FaqRepository = require("../repositories/faqRepository");

class FaqController {
  faqRepository;
  constructor(){
    this.faqRepository = new FaqRepository();
  }
   async addFaq(req, res, next) {
    try {
      const { question, answer } = req.body;
      await this.faqRepository.addFaq(question, answer);
      res.json({ success: true, msg: "Faq was added" });
    } catch (err) {
      next(err);
    }
  }

   async getFaqs(req, res, next) {
    try {
      const faqs = await this.faqRepository.getFaqs();
      res.json({ data: faqs, success: true });
    } catch (err) {
     next(err);
    }
  }

   async deleteFaq(req, res, next) {
    try {
      const { id } = req.body;
      await this.faqRepository.deleteFaq(id);
      res.json({ success: true, msg: "Faq was deleted" });
    } catch (err) {
     next(err);
    }
  }
}

module.exports = FaqController;