const WebPublicRepository = require("../repositories/WebPublicRepository");
const ApiException = require("../exceptions/ApiException");

async function handleApiResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, get it as text
      const errorText = await response.text();
      errorData = { error: { message: errorText, code: response.status } };
    }
    
    const {
      code,
      message,
      type,
      error_user_msg
    } = errorData.error || {};

    const userFriendlyMessage = error_user_msg || message || "An error occurred";

    throw new ApiException(
      userFriendlyMessage,
      type || "Unknown",
      code || response.status
    );
  }

  try {
    return await response.json();
  } catch (e) {
    // If response is not JSON, return the text
    return await response.text();
  }
}

async function verifyMetaWebhook(req) {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  const { meta_webhook_verifcation_key } =
    await (new WebPublicRepository()).getWebPublic();

  if (mode && token) {
    if (mode === "subscribe" && token === meta_webhook_verifcation_key) {
      console.log("WEBHOOK_VERIFIED");
      return {
        status: 200,
        message: "WEBHOOK_VERIFIED",
        data: challenge,
      };
    }
  }

  return {
    status: 403,
    message: "UNAUTHORIZED",
    data: {},
  };
}



module.exports = {
  handleApiResponse,
  verifyMetaWebhook,
};
