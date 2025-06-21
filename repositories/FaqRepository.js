const { query } = require("express-validator");
const { Faq } = require("../models");
const Repository = require("./Repository");

class FaqRepository extends Repository {
  constructor() {
    super(Faq);
  }

  async addFaq(question, answer) {
    return this.create({ question, answer });
  }

  async getFaqs(query) {
    return this.paginate(query);
  }

  async deleteFaq(id) {
    return this.delete({ id });
  }
}

module.exports = FaqRepository;
