const { TEXT } = require("../../types/message.types");
const { millisecondsToSeconds } = require("../../utils/date.utils");
const { createChatId } = require("../../utils/others.utils");
const { dataGet } = require("../../utils/others.utils");

class InstagramMessagesDto {
    constructor(data = {}) {
        this.data = data;
    }

    getSenderId() {
        return dataGet(this.data, "sender.id");
    }

    getRecipientId() {
        return dataGet(this.data, "recipient.id");
    }

    isDeliveryReceipt() {
        return dataGet(this.data, "message.is_echo");
    }

    getOwnerId() {
        if (this.isDeliveryReceipt()) return this.getSenderId();
        return this.getRecipientId();
    }

    getTargetId() {
        if (this.isDeliveryReceipt()) return this.getRecipientId();
        return this.getSenderId();
    }

    isReaction() {
        return !!dataGet(this.data, "reaction");
    }

    isMessage() {
        return !!dataGet(this.data, "message");
    }

    getMessageObj() {
        return dataGet(this.data, "message");
    }

    getReactionObj() {
        return dataGet(this.data, "reaction");
    }

    getMessageId() {
        return dataGet(this.data, "message.id");
    }

    getMessageText() {
        return dataGet(this.data, "message.text");
    }

    getMessageTimestamp() {
        return millisecondsToSeconds(dataGet(this.data, "timestamp"));
    }

    getId() {
        return this.isReaction() ? dataGet(this.data, "reaction.mid") : dataGet(this.data, "message.mid");
    }

    getEmoji() {
        return dataGet(this.data, "reaction.emoji");
    }

    getChatId() {
        return createChatId(this.getTargetId(), this.getOwnerId());
    }

    hasAttachment() {
        return !!dataGet(this.data, "message.attachments");
    }

    getAttachmentType() {
        return dataGet(this.data, "message.attachments.0.type");
    }
    getAttachmentUrl() {
        return dataGet(this.data, "message.attachments.0.payload.url");
    }

    getType() {
        if (this.hasAttachment()) return this.getAttachmentType();
        return TEXT;
    }


}

module.exports = InstagramMessagesDto;