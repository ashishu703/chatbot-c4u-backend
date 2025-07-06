const WebPublicRepository = require("../repositories/WebPublicRepository");
const ApiException = require("../exceptions/ApiException");

async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    const { code, message, type } = errorData.error || {};
    throw new ApiException(
      message || "An error occurred",
      type || "Unknown",
      code || response.status
    );
  }
  return await response.json();
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
