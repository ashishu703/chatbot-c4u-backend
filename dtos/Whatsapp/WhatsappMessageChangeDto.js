const { getCurrentTimeStampInSeconds } = require("../../utils/date.utils");
const { createChatId } = require("../../utils/others.utils");
const { dataGet } = require("../../utils/others.utils");
const WhatsappMessageDto = require("./WhatsappMessageDto");
const WhatsappMessageStatusDto = require("./WhatsappMessageStatusDto");

class WhatsappMessageChangeDto {
    constructor(data = {}) {
        this.data = data;
    }

    getDisplayNo() {
        return dataGet(this.data, "value.metadata.display_phone_number");
    }

    getPhoneNo() {
        return dataGet(this.data, "value.metadata.phone_number_id");
    }

    getTargetName() {
        return dataGet(this.data, "value.contacts.0.profile.name");
    }

    getTargetPhoneNo() {
        if (this.isMessageEvent())
            return dataGet(this.data, "value.messages.0.from");
        else if (this.isDeliveryStatus())
            return dataGet(this.data, "value.statuses.0.recipient_id");
    }


    getField() {
        return dataGet(this.data, "field");
    }

    getTargetId() {
        return this.getTargetPhoneNo();
    }

    getOwnerId() {
        return this.getDisplayNo();
    }

    getChatId() {
        return createChatId(this.getTargetId(), this.getOwnerId());
    }

    isMessageEvent() {
        return !!dataGet(this.data, "value.messages");
    }

    isDeliveryStatus() {
        return !!dataGet(this.data, "value.statuses");
    }

    getMessagesObj() {
        return dataGet(this.data, "value.messages");
    }

    getStatusObj() {
        return dataGet(this.data, "value.statuses");
    }

    getMessages() {
        return this.getMessagesObj().map((message) => new WhatsappMessageDto(message));
    }

    getStatuses() {
        return this.getStatusObj().map((message) => new WhatsappMessageStatusDto(message));
    }

    getTimestamp() {
        if (this.isDeliveryStatus()) {
            return dataGet(this.data, "value.statuses.0.timestamp");
        }
        else if (this.isMessageEvent()) {
            return dataGet(this.data, "value.messages.0.timestamp");
        }
        return getCurrentTimeStampInSeconds();
    }

}

module.exports = WhatsappMessageChangeDto;