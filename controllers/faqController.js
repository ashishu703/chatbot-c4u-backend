const FaqRepository = require("../repositories/faqRepository");

class FaqController {
  faqRepository;
  constructor(){
    this.faqRepository = new FaqRepository();
  }
   async addFaq(req, res) {
    try {
      const { question, answer } = req.body;
      await this.faqRepository.addFaq(question, answer);
      res.json({ success: true, msg: "Faq was added" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getFaqs(req, res) {
    try {
      const faqs = await this.faqRepository.getFaqs();
      res.json({ data: faqs, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async deleteFaq(req, res) {
    try {
      const { id } = req.body;
      await this.faqRepository.deleteFaq(id);
      res.json({ success: true, msg: "Faq was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = FaqController;