const { MetaTempleteMedia } = require("../models");
const Repository = require("./Repository");

class WhatsappTempleteMediaRepository extends Repository {
  constructor() {
    super(MetaTempleteMedia);
  }

};

module.exports = WhatsappTempleteMediaRepository;