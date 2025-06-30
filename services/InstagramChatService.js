
const InstagramMessageApi = require("../api/Instagram/InstagramMessageApi");

class InstagramChatService {


  constructor(user = null, accessToken = null) {
    this.instagramMessageApi = new InstagramMessageApi(user, accessToken);
  }

  
  async send({ text, senderId }) {
    await this.instagramMessageApi.initMeta();
    const payload = { recipient: { id: senderId }, message: { text } };
    return this.instagramMessageApi.sendMessage(payload);
  }

  async sendAttachment(url, type, senderId) {
    await this.instagramMessageApi.initMeta();
    const payload = {
      recipient: { id: senderId },
      message: { attachment: { type, payload: { url } } },
    };
    return this.instagramMessageApi.sendMessage(payload);
  }

};


module.exports = InstagramChatService
