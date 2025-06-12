const { dataGet } = require("../../utils/others.utils");
const InstagramMessageChangeDto = require("./InstagramMessageChangeDto");
const InstagramMessagesDto = require("./InstagramMessagesDto");

class InstagramWebhookDto {
    constructor(data) {
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
        return messages.map((message) => new InstagramMessagesDto(message));
    }

    getChanges() {
        const changes = dataGet(this.data, "changes");
        return changes.map((change) => new InstagramMessageChangeDto(change));
    }


}

module.exports = InstagramWebhookDto;