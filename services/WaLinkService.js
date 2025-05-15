const WaLinkRepository = require('../repositories/waLinkRepository');
const { isValidEmail } = require('../utils/validation');
const { createWhatsAppLink } = require('../utils/whatsapp');

class WaLinkService {
  waLinkRepository;
  constructor() {
    this.waLinkRepository = new WaLinkRepository();
  }
  async generateWaLink({ mobile, email, msg }) {
    if (!mobile || !email) {
      throw new Error('Ops.. mobile and email fields are required');
    }
    if (!isValidEmail(email)) {
      throw new Error('Please provide a valid email id');
    }
    await this.waLinkRepository.create({ wa_mobile: mobile, email, msg });
    return createWhatsAppLink(mobile.replace('+', ''), msg);
  }
}

module.exports = WaLinkService;