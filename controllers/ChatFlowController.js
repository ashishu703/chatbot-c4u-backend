const FillAllFieldsException = require("../exceptions/CustomExceptions/FIllAllFieldsException");
const FlowIdException = require("../exceptions/CustomExceptions/FlowIdException");
const FlowService = require("../services/ChatFlowService");
const {formSuccess} = require("../utils/response.utils");
class FlowController {
  flowService;
  constructor() {
    this.flowService = new FlowService();
  }
   async addFlow(req, res, next) {
    try {
      const { title, nodes, edges, flowId } = req.body;
      const user = req.decode;

      if (!title || !nodes || !edges || !flowId) {
        throw new FillAllFieldsException();
      }

     await this.flowService.addFlow({ title, nodes, edges, flowId, user });
      return formSuccess({ msg: __t("flow_saved") });
    } catch (err) {
      next(err);
    }
  }

   async getFlows(req, res, next) {
    try {
      const user = req.decode;
      const flows = await this.flowService.getFlows(user.uid);
      return formSuccess({ data: flows });
    } catch (err) {
      next(err);
    }
  }

   async deleteFlow(req, res, next) {
    try {
      const { id, flowId } = req.body;
      const user = req.decode;
     await this.flowService.deleteFlow(id, flowId, user.uid);
      return formSuccess({ msg: __t("flow_deleted") });
    } catch (err) {
      next(err);
    }
  }

  async getByFlowId(req, res, next) {
    try {
      const { flowId } = req.body;

      if (!flowId) {
        throw new FlowIdException();
      }

      const { nodes, edges } = await this.flowService.getFlowById(
        req.decode.uid,
        flowId
      );

      return formSuccess({ nodes, edges });
    } catch (err) {
      next(err);
    }
  }


   async getActivity(req, res, next) {
    try {
      const { flowId } = req.body;
      const user = req.decode;
      const result = await this.flowService.getActivity(flowId, user.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async removeNumberFromActivity(req, res, next) {
    try {
      const { type, number, flowId } = req.body;
      const user = req.decode;
    await this.flowService.removeNumberFromActivity(type, number, flowId, user.uid);
      return formSuccess({msg: __t("number_removed") });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FlowController;
