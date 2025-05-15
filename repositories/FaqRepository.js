const {Faq} = require("../models");

class FaqRepository {
   async addFaq(question, answer) {
    if (!question || !answer) {
      throw new Error("Please provide question and answer both");
    }
    await Faq.create({ question, answer });
  }

   async getFaqs() {
    return await Faq.findAll();
  }

   async deleteFaq(id) {
    await Faq.destroy({ where: { id } });
  }
}

module.exports = FaqRepository;