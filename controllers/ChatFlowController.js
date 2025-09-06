const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const FlowIdException = require("../exceptions/CustomExceptions/FlowIdException");
const FlowService = require("../services/ChatFlowService");
const { __t } = require("../utils/locale.utils");
const { formSuccess } = require("../utils/response.utils");
class FlowController {
  flowService;
  constructor() {
    this.flowService = new FlowService();
  }
  async addFlow(req, res, next) {
    try {
      const { title, nodes, edges, flowId, startNodeId } = req.body;
      const { uid } = req.decode

      if (!title || !nodes || !edges || !flowId) {
        throw new FillAllFieldsException();
      }

      await this.flowService.addFlow({ title, nodes, edges, flowId, startNodeId, uid });
      return formSuccess(res, { msg: __t("flow_saved") });
    } catch (err) {
      next(err);
    }
  }

  async getFlows(req, res, next) {
    try {
      const query = req.query;
      const user = req.decode;
      const flows = await this.flowService.getFlows({
        where: { uid: user.uid },
        ...query,
      });
      return formSuccess(res, { ...flows });
    } catch (err) {
      next(err);
    }
  }

  async deleteFlow(req, res, next) {
    try {
      const { id, flowId } = req.body;
      const {uid} = req.decode;
      await this.flowService.deleteFlow(id, flowId, uid);
      return formSuccess(res, { msg: __t("flow_deleted") });
    } catch (err) {
      next(err);
    }
  }

  async getByFlowId(req, res, next) {
    try {
      const { flowId } = req.body;
      const { uid } = req.decode

      if (!flowId) {
        throw new FlowIdException();
      }


      const flow = await this.flowService.getFlowById(
        uid,
        flowId
      );

      return formSuccess(res, flow);
    } catch (err) {
      next(err);
    }
  }


  async getActivity(req, res, next) {
    try {
      const { flowId } = req.body;
      const user = req.decode;
      const result = await this.flowService.getActivity(flowId, user.uid);
      return formSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async removeNumberFromActivity(req, res, next) {
    try {
      const { type, number, flowId } = req.body;
      const user = req.decode;
      await this.flowService.removeNumberFromActivity(type, number, flowId, user.uid);
      return formSuccess(res, { msg: __t("number_removed") });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FlowController;
