const waLinkRepository = require('../repositories/waLinkRepository');
const { isValidEmail } = require('../utils/validation');
const { createWhatsAppLink } = require('../utils/whatsapp');

class WaLinkService {
  async generateWaLink({ mobile, email, msg }) {
    if (!mobile || !email) {
      throw new Error('Ops.. mobile and email fields are required');
    }
    if (!isValidEmail(email)) {
      throw new Error('Please provide a valid email id');
    }
    await waLinkRepository.create({ wa_mobile: mobile, email, msg });
    return createWhatsAppLink(mobile.replace('+', ''), msg);
  }
}

module.exports = new WaLinkService();