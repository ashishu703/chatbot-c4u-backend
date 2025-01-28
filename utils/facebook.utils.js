const { META_WEBHOOK_VERIFICATION_KEY } = require("../constants/facebook.constant");
const { convertNumberToRandomString } = require("../functions/function");
const FacebookException = require("./../exceptions/FacebookException");

async function handleApiResponse(response) {

    if (!response.ok) {
        const errorData = await response.json();
        const { code, message, type } = errorData.error || {};
        throw new FacebookException(message || "An error occurred", type || "Unknown", code || response.status);
    }
    return await response.json();
}

function verifyMetaWebhook(req) {

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === META_WEBHOOK_VERIFICATION_KEY) {
            console.log("WEBHOOK_VERIFIED");
            return {
                status: 200,
                message: "WEBHOOK_VERIFIED",
                data: challenge
            }
        }
    }

    return {
        status: 403,
        message: "UNAUTHORIZED",
        data: 0
    }
}

function prepareChatPath(
    uid,
    chatId
) {
    return `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
}

 function createChatId(senderId, receiverId) {
   return convertNumberToRandomString(senderId + receiverId);
}


module.exports = {
    handleApiResponse,
    verifyMetaWebhook,
    prepareChatPath,
    createChatId
}