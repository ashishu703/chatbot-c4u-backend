const { dataGet } = require("../../utils/others.utils");
const MessengerMessagesDto = require("./MessengerMessagesDto");
class MessengerWebhookDto {
    constructor(data = {}) {
        this.data = data;
    }

    isMessage() {
        return !!dataGet(this.data, "messaging");
    }

   
    getMessages() {
        const messages = dataGet(this.data, "messaging");
        return messages.map((message) => new MessengerMessagesDto(message));
    }

   


}

module.exports = MessengerWebhookDto;