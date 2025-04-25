const FaqRepository = require("../repositories/faqRepository");

class FaqController {
  static async addFaq(req, res) {
    try {
      const { question, answer } = req.body;
      await FaqRepository.addFaq(question, answer);
      res.json({ success: true, msg: "Faq was added" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getFaqs(req, res) {
    try {
      const faqs = await FaqRepository.getFaqs();
      res.json({ data: faqs, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async deleteFaq(req, res) {
    try {
      const { id } = req.body;
      await FaqRepository.deleteFaq(id);
      res.json({ success: true, msg: "Faq was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = FaqController;