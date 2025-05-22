const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const WaLinkRepository = require("../repositories/waLinkRepository");
const { isValidEmail } = require("../utils/validation");
const { createWhatsAppLink } = require("../utils/whatsapp");
const InvalidEmailIdException = require("../exceptions/CustomExceptions/InvalidEmailIdException");

class WaLinkService {
  waLinkRepository;
  constructor() {
    this.waLinkRepository = new WaLinkRepository();
  }
  async generateWaLink({ mobile, email, msg }) {
    if (!mobile || !email) {
      throw new FillAllFieldsException();
    }
    if (!isValidEmail(email)) {
      throw new InvalidEmailIdException();
    }
    await this.waLinkRepository.create({ wa_mobile: mobile, email, msg });
    return createWhatsAppLink(mobile.replace("+", ""), msg);
  }
}

module.exports = WaLinkService;
