const { Templet } = require("../models");
const Repository = require("./Repository");

class TempletRepository extends Repository {
  constructor() {
    super(Templet);
  }

}

module.exports = TempletRepository;
