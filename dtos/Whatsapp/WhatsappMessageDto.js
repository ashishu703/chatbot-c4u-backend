const { TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT } = require("../../types/message.types");
const { dataGet } = require("../../utils/others.utils");


class WhatsappMessageDto {
    constructor(data) {
        this.data = data;
    }

    getFrom() {
        return dataGet(this.data, "from");
    }

    getId() {
        if (this.isReaction())
            return dataGet(this.data, "reaction.message_id");
        return dataGet(this.data, "id");
    }

    getMessageTimestamp() {
        return dataGet(this.data, "timestamp");
    }

    getMessageText() {
        if (this.isTextMessage())
            return dataGet(this.data, "text.body");
        else if (
            this.isImageMessage() ||
            this.isVideoMessage() ||
            this.isAudioMessage()
        )
            return this.getCaption();
        else if (this.isDocumentMessage())
            return this.getFileName();
        return "";
    }


    getType() {
        return dataGet(this.data, "type");
    }

    isTextMessage() {
        return this.getType() === TEXT;
    }

    isImageMessage() {
        return this.getType() === IMAGE;
    }

    isVideoMessage() {
        return this.getType() === VIDEO;
    }

    isAudioMessage() {
        return this.getType() === AUDIO;
    }

    isDocumentMessage() {
        return this.getType() === DOCUMENT;
    }

    isReaction() {
        return this.getType() === "reaction";
    }

    getEmoji() {
        return dataGet(this.data, "reaction.emoji");
    }

    hasAttachment() {
        if (this.isImageMessage() || this.isVideoMessage() || this.isAudioMessage() || this.isDocumentMessage())
            return true;
        return false;
    }

    getAttachmentId() {
        const type = this.getType();
        return dataGet(this.data, `${type}.id`);
    }

    getCaption() {
        const type = this.getType();
        return dataGet(this.data, `${type}.caption`);
    }

    getFileName() {
        const type = this.getType();
        return dataGet(this.data, `${type}.filename`);
    }

    setAttachmentUrl(url) {
        this.attachmentUrl = url
    }

    getAttachmentUrl() {
        return this.attachmentUrl
    }

    getAttachmentType() {
        return this.getType()
    }

}

module.exports = WhatsappMessageDto;