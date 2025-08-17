const MessengerTextMessageHandler = require('./MessengerTextMessageHandler');

class MessengerConditionMessageHandler extends MessengerTextMessageHandler {
  constructor(chatbotService) {
    super(chatbotService);
  }

  async handleMessage(nodeData, chatbot) {
    console.log('Debug: [Condition Node] Processing condition node:', {
      nodeType: nodeData.type,
      hasDataState: !!nodeData.data?.state,
      timeDelayType: nodeData.data?.state?.timeDelayType,
      timeDelayValue: nodeData.data?.state?.timeDelayValue,
      timeDelayUnit: nodeData.data?.state?.timeDelayUnit
    });

    // For condition nodes, we need to handle time delays
    const state = nodeData.data?.state;
    if (state && state.timeDelayValue && state.timeDelayValue > 0) {
      console.log(`Debug: [Condition Node] Applying time delay: ${state.timeDelayValue} ${state.timeDelayUnit}`);
      
      // Convert delay to milliseconds
      let delayMs = state.timeDelayValue * 1000; // Default to seconds
      if (state.timeDelayUnit === 'minutes') {
        delayMs = state.timeDelayValue * 60 * 1000;
      } else if (state.timeDelayUnit === 'hours') {
        delayMs = state.timeDelayValue * 60 * 60 * 1000;
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
      console.log(`Debug: [Condition Node] Time delay completed`);
    }

    console.log('Debug: [Condition Node] Continuing to next node after delay');
    await this.continueToNextNode(nodeData, chatbot);
  }

  async continueToNextNode(nodeData, chatbot) {
    try {
      const { flow_id: flowId } = chatbot;
      const { node_id: nodeId } = nodeData;
      
      console.log('Debug: [Condition Node] Looking for next node after condition:', {
        flowId: flowId,
        currentNodeId: nodeId
      });
      
      // Find the edge that starts from this condition node
      const nextEdge = await this.chatbotService.edgeRepository.findEdgeUsingSourceWithTargetNode(flowId, nodeId);
      
      if (nextEdge && nextEdge.targetNode) {
        console.log('Debug: [Condition Node] Found next node:', {
          nextNodeId: nextEdge.targetNode.node_id,
          nextNodeType: nextEdge.targetNode.data.type
        });
        
        // Process the next node
        const messageHandler = this.chatbotService.getMessageHandlerFactory().createHandler(
          nextEdge.targetNode.data.type, 
          this.chatbotService
        );
        
        await messageHandler.handleMessage(nextEdge.targetNode.data, chatbot);
      } else {
        console.log('Debug: [Condition Node] No next node found, flow ended');
      }
    } catch (error) {
      console.error('Debug: [Condition Node] Error continuing to next node:', error);
    }
  }
}

module.exports = MessengerConditionMessageHandler; 