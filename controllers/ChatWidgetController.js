const ChatWidgetService = require("../services/ChatWidgetService");
const { __t } = require("../utils/locale.utils");
const {formSuccess} = require("../utils/response.utils");
class ChatWidgetController {
    chatWidgetService;
  constructor() {
    this.chatWidgetService = new ChatWidgetService();
  }

  async addWidget(req, res, next) {
    try {
     await this.chatWidgetService.addWidget(req);
      return formSuccess({ msg:__t("widget_added") });
    } catch (err) {
      next(err);
    }
  }
  async getMyWidgets(req, res, next) {
    try {
      const result = await this.chatWidgetService.getMyWidgets(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteWidget(req, res, next) {
    try {
      const { id } = req.body;
     await this.chatWidgetService.deleteWidget(id);
      return formSuccess({msg:__t("widget_deleted_success") });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatWidgetController;
