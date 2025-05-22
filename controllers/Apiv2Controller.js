const ApiKeysNotFoundException = require("../exceptions/CustomExceptions/ApiKeysNotFoundException");
const MessageObjectKeyIsRequiredException = require("../exceptions/CustomExceptions/MessageObjectKeyIsRequiredException");
const MetaService = require("../services/metaService");
const ProvideSendToKeyException = require("../exceptions/CustomExceptions/ProvideSendToKeyException");
const ProvideTempletNameException = require("../exceptions/CustomExceptions/ProvideTempletNameException");
const ProvideExampleArrArrayException = require("../exceptions/CustomExceptions/ProvideExampleArrArrayException");
const {formSuccess} = require("../utils/response.utils");
class ApiV2Controller {
  metaService;
  constructor() { 
    this.metaService = new MetaService();
  }
   async sendMessage(req, res, next) {
    try {
      const { token } = req.query;
      const { messageObject } = req.body;

      if (!token) {
        throw new ApiKeysNotFoundException();
      }

      if (!messageObject) {
       throw new MessageObjectKeyIsRequiredException();
      }

      const result = await this.metaService.sendMessage(token, messageObject);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async sendTemplate(req, res, next) {
    try {
      const { sendTo, templetName, exampleArr, token, mediaUri } = req.body;

      if (!token) {
        throw new ApiKeysNotFoundException();
      }

      if (!sendTo) {
       throw new ProvideSendToKeyException();
      }

      if (!templetName) {
        throw new ProvideTempletNameException();
      }

      if (!exampleArr) {
        throw new ProvideExampleArrArrayException();
      }

      const result = await this.metaService.sendTemplate({
        token,
        sendTo,
        templetName,
        exampleArr,
        mediaUri,
      });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ApiV2Controller;