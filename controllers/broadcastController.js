const BroadcastService = require("../services/broadcastService");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FIllAllFieldsException");
const InvalidPhonebookException = require("../exceptions/CustomExceptions/InvalidPhonebookException");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const {formSuccess} = require("../utils/response.utils");
class BroadcastController {
  broadcastService;
  constructor() { 
    this.broadcastService = new BroadcastService();
  }
   async addBroadcast(req, res, next) {
    try {
      const { title, templet, phonebook, scheduleTimestamp, example } = req.body;
      const user = req.decode;

      if (!title || !templet?.name || !phonebook || !scheduleTimestamp) {
        throw new FillAllFieldsException();
      }

      if (!phonebook.id) {
        throw new InvalidPhonebookException();
      }

      const result = await this.broadcastService.addBroadcast({
        title,
        templet,
        phonebook,
        scheduleTimestamp,
        example,
        user,
      });

      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async getBroadcasts(req, res, next) {
    try {
      const user = req.decode;
      const broadcasts = await this.broadcastService.getBroadcasts(user.uid);
      return formSuccess({ data: broadcasts});
    } catch (err) {
     next(err);
    }
  }

   async getBroadcastLogs(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;

      const result = await this.broadcastService.getBroadcastLogs(id, user.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async changeBroadcastStatus(req, res, next) {
    try {
      const { status, broadcast_id } = req.body;
      const user = req.decode;

      if (!status) {
       throw new InvalidRequestException();
      }

      const result = await this.broadcastService.changeBroadcastStatus(broadcast_id, status, user.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async deleteBroadcast(req, res, next) {
    try {
      const { broadcast_id } = req.body;
      const user = req.decode;

      const result = await this.broadcastService.deleteBroadcast(broadcast_id, user.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BroadcastController;