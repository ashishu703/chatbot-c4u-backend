const { dataGet } = require("../../utils/others.utils");
const MessengerMessagesDto = require("./MessengerMessagesDto");
const MessengerMessageChangeDto = require("./MessengerMessageChangeDto");

class MessengerWebhookDto {
    constructor(data = {}) {
        this.data = data;
    }

    isMessage() {
        return !!dataGet(this.data, "messaging");
    }

    isChange() {
        return !!dataGet(this.data, "changes");
    }

    getMessages() {
        const messages = dataGet(this.data, "messaging");
        return messages.map((message) => new MessengerMessagesDto(message));
    }

    getChanges() {
        const changes = dataGet(this.data, "changes");
        return changes.map((change) => new MessengerMessageChangeDto(change));
    }
}

module.exports = MessengerWebhookDto;