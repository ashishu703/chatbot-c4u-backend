const { TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, INTERACTIVE, REACTION } = require("../../types/message.types");
const { REQUEST_API, DISABLE_CHAT_TILL, ASSIGN_AGENT } = require("../../types/specified-messages.types");
const { replacePlaceholders } = require("../../utils/flow-nodes.utils");
const { dataGet } = require("../../utils/others.utils");

class MessengerMessageDto {
    constructor(data = {}) {
        this.data = data;
    }

    getContent() {
        return this.data;
    }

    getMainContentBody() {
        return dataGet(this.data, `${this.getType()}`, {});
    }

    getType() {
        return dataGet(this.data, "type");
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

    getInteractiveType() {
        return dataGet(this.data, "interactive.type");
    }

    getInteractiveTitle() {
        const interactiveType = this.getInteractiveType();
        return dataGet(this.data, `interactive.${interactiveType}.title`);
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
        ].includes(actionName) ? true : false;
    }

    hasAttachment() {
        return [IMAGE, VIDEO, AUDIO, DOCUMENT].includes(this.getType());
    }

    getCaption() {
        const type = this.getType();
        return dataGet(this.data, `${type}.caption`);
    }

    getAttachmentUrl() {
        const type = this.getType();
        return dataGet(this.data, `${type}.link`);
    }

    getAttachmentType() {
        return this.getType();
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
            case 'button_reply':
                this.applyButtonInteractiveVariables(variables);
                break;
            default:
                break;
        }
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

module.exports = MessengerMessageDto; 