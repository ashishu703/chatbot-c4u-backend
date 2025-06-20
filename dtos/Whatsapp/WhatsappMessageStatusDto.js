const { TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT } = require("../../types/message.types");
const { dataGet } = require("../../utils/others.utils");


class WhatsappMessageStatusDto {
    constructor(data) {
        this.data = data;
    }

    getFrom() {
        return dataGet(this.data, "from");
    }

    getId() {
        return dataGet(this.data, "id");
    }

    getTimestamp() {
        return dataGet(this.data, "timestamp");
    }

    getStatus() {
        return dataGet(this.data, "status");
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

}

module.exports = WhatsappMessageStatusDto;