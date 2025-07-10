const { DisabledChat } = require("../models");
const Repository = require("./Repository");

class DisabledChatRepository extends Repository {

  constructor() {
    super(DisabledChat);
  }


}

module.exports = DisabledChatRepository;
