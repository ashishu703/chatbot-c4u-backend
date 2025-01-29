const { MESSENGER_KEY } = require("../constants/chat.constant");

function convertWebhookReciveMessageToJsonObj(messageObj) {

    return {
        timestamp: messageObj.timestamp / 1000,
        message_id: messageObj.message.mid,
        type: "text",
        status: "",
        text: messageObj.message.text,
        reaction: "",
        route: "INCOMING"
    };
}

function convertWebhookRecieptToJsonObj(messageObj) {
    return {
        timestamp: messageObj.timestamp / 1000,
        message_id: messageObj.message.mid,
        type: "text",
        text: messageObj.message.text,
        status: "sent",
        reaction: "",
        route: "OUTGOING"
    };
}

function convertWebhookToDBChatCreateObject(object) {
    const {
        chatId,
        uid,
        page_id,
        timestamp,
        sender,
        first_name,
        last_name,
    } = object


    return {
        chat_id: chatId,
        uid: uid,
        recipient: page_id,
        type: MESSENGER_KEY,
        last_message_came: timestamp / 1000,
        chat_note: null,
        chat_tags: null,
        sender_name: combineNames({ first_name, last_name }),
        sender_mobile: sender.id,
        chat_status: "open",
        is_opened: 0,
        last_message: null
    }
}


function convertWebhookToDBChatUpdateObject(object) {
    const {
        timestamp,
        message
    } = object

    return {
        last_message_came: timestamp / 1000,
        chat_status: "open",
        is_opened: 0,
        last_message: message
    }
}

function combineNames({ first_name, last_name }) {
    return `${first_name} ${last_name}`
}


module.exports = {
    convertWebhookReciveMessageToJsonObj,
    convertWebhookToDBChatCreateObject,
    convertWebhookToDBChatUpdateObject,
    convertWebhookRecieptToJsonObj
}