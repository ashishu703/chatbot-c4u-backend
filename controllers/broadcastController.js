const BroadcastService = require("../services/broadcastService");

class BroadcastController {
  broadcastService;
  constructor() { 
    this.broadcastService = new BroadcastService();
  }
   async addBroadcast(req, res) {
    try {
      const { title, templet, phonebook, scheduleTimestamp, example } = req.body;
      const user = req.decode;

      if (!title || !templet?.name || !phonebook || !scheduleTimestamp) {
        return res.json({ success: false, msg: "Please enter all details" });
      }

      if (!phonebook.id) {
        return res.json({ success: false, msg: "Invalid phonebook provided" });
      }

      const result = await this.broadcastService.addBroadcast({
        title,
        templet,
        phonebook,
        scheduleTimestamp,
        example,
        user,
      });

      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getBroadcasts(req, res) {
    try {
      const user = req.decode;
      const broadcasts = await this.broadcastService.getBroadcasts(user.uid);
      res.json({ data: broadcasts, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getBroadcastLogs(req, res) {
    try {
      const { id } = req.body;
      const user = req.decode;

      const result = await this.broadcastService.getBroadcastLogs(id, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async changeBroadcastStatus(req, res) {
    try {
      const { status, broadcast_id } = req.body;
      const user = req.decode;

      if (!status) {
        return res.json({ success: false, msg: "Invalid request" });
      }

      const result = await this.broadcastService.changeBroadcastStatus(broadcast_id, status, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async deleteBroadcast(req, res) {
    try {
      const { broadcast_id } = req.body;
      const user = req.decode;

      const result = await this.broadcastService.deleteBroadcast(broadcast_id, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = BroadcastController;