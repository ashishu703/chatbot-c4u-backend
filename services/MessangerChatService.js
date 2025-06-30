const MessengerMessageApi = require("../api/Messanger/MessengerMessageApi");
const { VIDEO, FILE, AUDIO } = require("../types/message.types");

class MessangerChatService {

  constructor(user = null, accessToken = null) {
    this.messageApi = new MessengerMessageApi(user, accessToken);
  }



  async send({ text, senderId }) {
    await this.messageApi.initMeta();
    const payload = {
      recipient: { id: senderId },
      message: { text },
      messaging_type: "RESPONSE",
    };
    return this.messageApi.sendMessage(payload);
  }

  async sendImage({ senderId, url }) {
    return this.sendAttachment(url, IMAGE, senderId);
  }

  async sendVideo({ senderId, url }) {
    return this.sendAttachment(url, VIDEO, senderId);
  }

  async sendDoc({ senderId, url }) {
    return this.sendAttachment(url, FILE, senderId);
  }

  async sendAudio({ senderId, url }) {
    return this.sendAttachment(url, AUDIO, senderId);
  }

  async sendAttachment(url, type, senderId) {
    await this.messageApi.initMeta();
    const payload = {
      recipient: { id: senderId },
      message: {
        attachment: {
          type,
          payload: {
            url,
          },
        },
      },
    };
    return this.messageApi.sendMessage(payload);
  }
};


module.exports = MessangerChatService