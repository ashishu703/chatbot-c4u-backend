const { SENT, OPEN } = require("../types/conversation-status.types");
const { TEXT } = require("../types/message.types");
const { MESSANGER, INSTAGRAM } = require("../types/social-platform-types");

function convertWebhookReciveMessageToJsonObj(messageObj) {
  // let type = TEXT,
  //   url = undefined;

  // if (
  //   messageObj.message.attachments &&
  //   messageObj.message.attachments.length > 0
  // ) {
  //   type = messageObj.message.attachments[0].type;
  //   url = messageObj.message.attachments[0].payload.url;
  // }

  // return {
  //   timestamp: messageObj.timestamp / 1000,
  //   message_id: messageObj.message.mid,
  //   type,
  //   url,
  //   status: "",
  //   text: messageObj.message.text,
  //   reaction: "",
  //   route: INCOMING,
  // };
}

function convertWebhookMessageToDBMessage(messageObj) {
  let type = TEXT,
    attchment_url = undefined;

  if (
    messageObj.hasAttachment()
  ) {
    type = messageObj.getAttachmentType();
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

function convertMessangerWebhookToDBChatCreateObject(object) {
  const { chatId, uid, page_id, timestamp, sender, first_name, last_name } =
    object;

  return {
    chat_id: chatId,
    uid: uid,
    recipient: page_id,
    type: MESSANGER,
    chat_note: null,
    chat_tags: [],
    sender_name: combineNames({ first_name, last_name }),
    sender_id: sender.id,
    chat_status: OPEN,
    is_opened: 0,
    last_message: null,
  };
}

function convertInstagramWebhookToDBChatCreateObject(object) {
  const { chatId, uid, page_id, timestamp, sender, username } = object;

  return {
    chat_id: chatId,
    uid: uid,
    recipient: page_id,
    type: INSTAGRAM,
    chat_note: null,
    chat_tags: [],
    sender_name: username,
    sender_id: sender.id,
    chat_status: OPEN,
    is_opened: 0,
    last_message: null,
  };
}

function convertWebhookToDBChatUpdateObject(object) {
  const { timestamp, message } = object;

  return {
    chat_status: OPEN,
    is_opened: 0,
    last_message: message,
  };
}

function combineNames({ first_name, last_name }) {
  return `${first_name} ${last_name}`;
}

module.exports = {
  convertWebhookReciveMessageToJsonObj,
  convertMessangerWebhookToDBChatCreateObject,
  convertInstagramWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookMessageToDBMessage,
};
