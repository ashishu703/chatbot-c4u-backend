const { LIST, BUTTON } = require("../../types/message-interactive.types");
const { TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, INTERACTIVE, REACTION } = require("../../types/message.types");
const { REQUEST_API, DISABLE_CHAT_TILL, ASSIGN_AGENT } = require("../../types/specified-messages.types");
const { replacePlaceholders } = require("../../utils/flow-nodes.utils");
const { dataGet } = require("../../utils/others.utils");


class WhatsappMessageDto {
    constructor(data = {}) {
        this.data = data;
    }

    getFrom() {
        return dataGet(this.data, "from");
    }

    getContent() {
        return this.data;
    }

    getMainContentBody() {
        return dataGet(this.data, `${this.getType()}`, {});
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
        else if (this.isInteractive())
            return this.getInteractiveTitle();
        else if (this.hasAttachment())
            return this.getCaption();
        return "";
    }


    getType() {
        return dataGet(this.data, "type");
    }

    getInteractiveType() {
        return dataGet(this.data, "interactive.type");
    }

    getInteractiveTitle() {
        const intrativeType = this.getInteractiveType();
        return dataGet(this.data, `interactive.${intrativeType}.title`);
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
        return this.getType() === REACTION;
    }
    isInteractive() {
        return this.getType() === INTERACTIVE;
    }

    isAction() {
        const actionName = this.getInteractiveTitle();

        return [
            REQUEST_API,
            DISABLE_CHAT_TILL,
            ASSIGN_AGENT
        ].includes(actionName) ? true : false
    }



    getEmoji() {
        return dataGet(this.data, "reaction.emoji");
    }

    hasAttachment() {
        return [IMAGE, VIDEO, AUDIO, DOCUMENT].includes(this.getType());
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

    getOriginalLink() {
        const type = this.getType();
        return dataGet(this.data, `${type}.link`);
    }

    getAttachmentType() {
        return this.getType()
    }

    applyVariables(variables) {
        const type = this.getType();
        switch (type) {
            case TEXT:
                this.applyTextVariables(variables);
                break;
            case VIDEO:
                this.applyVideoVariables(variables);
                break;
            case IMAGE:
                this.applyImageVariables(variables);
                break;
            case DOCUMENT:
                this.applyDocumentVariables(variables);
                break;
            case AUDIO:
                this.applyAudioVariables(variables);
                break;
            case INTERACTIVE:
                this.applyInteractiveVariables(variables);
                break;
            default:
                break;
        }
        return this;
    }


    applyInteractiveVariables(variables) {
        const type = this.getInteractiveType();
        switch (type) {
            case LIST:
                this.applyListInteractiveVariables(variables);
                break;
            case BUTTON:
                this.applyButtonInteractiveVariables(variables);
                break;
            default:
                break;
        }
    }

    applyListInteractiveVariables(variables) {
        this.data.interactive.header.text = replacePlaceholders(this.data.interactive.header.text, variables);
        this.data.interactive.body.text = replacePlaceholders(this.data.interactive.body.text, variables);
        this.data.interactive.footer.text = replacePlaceholders(this.data.interactive.footer.text, variables);
    }

    applyButtonInteractiveVariables(variables) {
        this.data.interactive.body.text = replacePlaceholders(this.data.interactive.body.text, variables);
    }


    applyTextVariables(variables) {
        this.data.text.body = replacePlaceholders(this.data.text.body, variables);
    }

    applyVideoVariables(variables) {
        this.data.video.caption = replacePlaceholders(this.data.video.caption, variables);
        this.data.video.link = replacePlaceholders(this.data.video.link, variables);
    }

    applyImageVariables(variables) {
        this.data.image.caption = replacePlaceholders(this.data.image.caption, variables);
        this.data.image.link = replacePlaceholders(this.data.image.link, variables);
    }

    applyDocumentVariables(variables) {
        this.data.document.caption = replacePlaceholders(this.data.document.caption, variables);
        this.data.document.link = replacePlaceholders(this.data.document.link, variables);
    }

    applyAudioVariables(variables) {
        this.data.audio.link = replacePlaceholders(this.data.audio.link, variables);
    }

}

module.exports = WhatsappMessageDto;