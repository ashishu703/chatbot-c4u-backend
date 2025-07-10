const { createChatId } = require("../../utils/others.utils");
const { dataGet } = require("../../utils/others.utils");

class MessengerMessageChangeDto {
    constructor(data = {}) {
        this.data = data;
    }

    isMessageSeenEvent() {
        return this.getField() === "messaging_seen";
    }


    getField() {
        return dataGet(this.data, "field");
    }

    getSenderId() {
        return dataGet(this.data, "value.sender.id");
    }

    getRecipientId() {
        return dataGet(this.data, "value.recipient.id");
    }

    getOwnerId() {
        return getSenderId();
    }

    getReadObject() {
        return dataGet(this.data, "value.read");
    }

    getId() {
        return dataGet(this.data, "value.read.mid");
    }

    getTargetId() {
        return this.getRecipientId();
    }

    getChatId() {
        return createChatId(this.getTargetId(), this.getOwnerId());
    }

}

module.exports = MessengerMessageChangeDto;