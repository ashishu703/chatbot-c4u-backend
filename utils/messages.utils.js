const { SENT, OPEN } = require("../types/conversation-status.types");
const { BUTTON, BUTTON_REPLY, LIST_REPLY } = require("../types/message-interactive.types");
const { TEXT, INTERACTIVE } = require("../types/message.types");
const { MESSANGER, INSTAGRAM } = require("../types/social-platform-types");



function convertWebhookMessageToDBMessage(messageObj) {
  let type = messageObj.getType(),
    attchment_url = undefined;

  if (messageObj.hasAttachment()) {
    attchment_url = messageObj.getAttachmentUrl();
  }

  return {
    timestamp: messageObj.getMessageTimestamp(),
    message_id: messageObj.getId(),
    type,
    body: {
      text: messageObj.getMessageText(),
      attchment_url,
      reaction: "",
    },
    status: SENT,
  };
}

function whatsappMessageDtoToSaveableBody(dto) {
  if (dto.isTextMessage()) {
    return {
      text: dto.getMessageText(),
      reaction: "",
    }
  } else if (dto.hasAttachment()) {
    const caption = dto.getCaption();
    const fileName = dto.getFileName();
    const link = dto.getAttachmentUrl() ?? dto.getOriginalLink();
    return {
      text: caption,
      fileName,
      attchment_url: link,
      reaction: "",
    }
  } else if (dto.isInteractive()) {
    return { ...dto.getMainContentBody(), reaction: "" }
  }
  return {};
}

function extractTextFromWhatsappMessage(message) {
  const { body, type } = message;

  switch (type) {
    case TEXT:
      return body.text;
    case INTERACTIVE:
      const {
        type: interactiveType
      } = body;
      switch (interactiveType) {
        case BUTTON_REPLY:
          return body.button_reply?.title;
        case LIST_REPLY:
          return body.list_reply?.title;
      }
  }


  return "";
}

function extractTextFromInstagramMessage(message) {
  const { body, type } = message;

  switch (type) {
    case TEXT:
      return body.text;
    case INTERACTIVE:
      const {
        type: interactiveType
      } = body;
      switch (interactiveType) {
        case BUTTON_REPLY:
          return body.button_reply?.title;
        case LIST_REPLY:
          return body.list_reply?.title;
      }
  }

  return "";
}

module.exports = {
  convertWebhookMessageToDBMessage,
  whatsappMessageDtoToSaveableBody,
  extractTextFromWhatsappMessage,
  extractTextFromInstagramMessage,
};
