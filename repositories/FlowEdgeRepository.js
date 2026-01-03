const { FlowEdge } = require("../models");
const Repository = require("./Repository");
const { INITIAL_MESSAGE } = require("../types/specified-messages.types");

class FlowEdgeRepository extends Repository {

  constructor() {
    super(FlowEdge);
  }

    async findEdgeWithTargetNode(flowId, triggerText) {
    const { Op } = require("sequelize");
    const { FlowNode } = require("../models");
    
    console.log('🔍 [EDGE_SEARCH] Searching for edge:', {
      flowId,
      triggerText,
      searchPattern: `%"value":"${triggerText}"%`
    });
    
    try {
      let results = await this.model.sequelize.query(`
        SELECT fe.*, 
               fn1.data as source_data, 
               fn2.data as target_data,
               fn1.node_id as source_node_id,
               fn2.node_id as target_node_id
        FROM flow_edges fe
        INNER JOIN flow_nodes fn1 ON fe.source = fn1.node_id
        INNER JOIN flow_nodes fn2 ON fe.target = fn2.node_id
        WHERE fe.flow_id = :flowId 
        AND fn1.data::text LIKE :searchPattern
      `, {
        replacements: { 
          flowId: flowId, 
          searchPattern: `%"value":"${triggerText}"%` 
        },
        type: this.model.sequelize.QueryTypes.SELECT
      });
      
      console.log('🔍 [EDGE_SEARCH] Exact match results:', results.length);
      
      if (results && results.length > 0) {
        const result = results[0];
        console.log('✅ [EDGE_SEARCH] Found exact match:', {
          edgeId: result.id,
          sourceHandle: result.source_handle,
          targetNodeId: result.target_node_id
        });
        
        return {
          ...result,
          sourceNode: {
            data: result.source_data,
            node_id: result.source_node_id
          },
          targetNode: {
            data: result.target_data,
            node_id: result.target_node_id
          }
        };
      }
      
      results = await this.model.sequelize.query(`
        SELECT fe.*, 
               fn1.data as source_data, 
               fn2.data as target_data,
               fn1.node_id as source_node_id,
               fn2.node_id as target_node_id
        FROM flow_edges fe
        INNER JOIN flow_nodes fn1 ON fe.source = fn1.node_id
        INNER JOIN flow_nodes fn2 ON fe.target = fn2.node_id
        WHERE fe.flow_id = :flowId 
        AND LOWER(fn1.data::text) LIKE LOWER(:searchPattern)
      `, {
        replacements: { 
          flowId: flowId, 
          searchPattern: `%"value":"${triggerText}"%` 
        },
        type: this.model.sequelize.QueryTypes.SELECT
      });
      
      console.log('🔍 [EDGE_SEARCH] Case-insensitive results:', results.length);
      
      if (results && results.length > 0) {
        const result = results[0];
        console.log('✅ [EDGE_SEARCH] Found case-insensitive match:', {
          edgeId: result.id,
          sourceHandle: result.source_handle,
          targetNodeId: result.target_node_id
        });
        
        return {
          ...result,
          sourceNode: {
            data: result.source_data,
            node_id: result.source_node_id
          },
          targetNode: {
            data: result.target_data,
            node_id: result.target_node_id
          }
        };
      }
      
    } catch (error) {
      console.error('❌ [EDGE_SEARCH] SQL search failed:', error.message);
    }
    
    console.log('🔍 [EDGE_SEARCH] Trying fallback search...');
    const fallbackResult = await this.model.findOne({
      where: {
        flow_id: flowId,
        source_handle: {
          [Op.like]: `%${triggerText}%`
        }
      },
      include: ["targetNode"],
    });
    
    if (fallbackResult) {
      console.log('✅ [EDGE_SEARCH] Found fallback match:', {
        edgeId: fallbackResult.id,
        sourceHandle: fallbackResult.source_handle,
        targetNodeId: fallbackResult.targetNode?.node_id
      });
    } else {
      console.log('❌ [EDGE_SEARCH] No edge found for trigger:', triggerText);
    }
    
    return fallbackResult;
  }

  async findEdgeUsingSourceWithTargetNode(flowId, sourceId) {
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source: sourceId,
      },
      include: ["targetNode"],
    });
  }

  async findFirstEdgeWithTargetNode(flowId) {
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source_handle: INITIAL_MESSAGE,
      },
      include: ["targetNode"],
    });
  }

  async findAllConnectedMessages(flowId, triggerText) {
    const { Op } = require("sequelize");
    const { FlowNode } = require("../models");
    
    console.log('🔍 [ALL_MESSAGES] Searching for ALL connected messages:', {
      flowId,
      triggerText,
      searchPattern: `%"value":"${triggerText}"%`
    });
    
    try {
      let results = await this.model.sequelize.query(`
        SELECT fe.*, 
               fn1.data as source_data, 
               fn2.data as target_data,
               fn1.node_id as source_node_id,
               fn2.node_id as target_node_id
        FROM flow_edges fe
        INNER JOIN flow_nodes fn1 ON fe.source = fn1.node_id
        INNER JOIN flow_nodes fn2 ON fe.target = fn2.node_id
        WHERE fe.flow_id = :flowId 
        AND fn1.data::text LIKE :searchPattern
        ORDER BY fe.id
      `, {
        replacements: { 
          flowId: flowId, 
          searchPattern: `%"value":"${triggerText}"%` 
        },
        type: this.model.sequelize.QueryTypes.SELECT
      });
      
      console.log('🔍 [ALL_MESSAGES] Found exact matches:', results.length);
      
      if (results && results.length > 0) {
        const allMatches = results.map(result => {
          console.log('✅ [ALL_MESSAGES] Match:', {
            edgeId: result.id,
            sourceHandle: result.source_handle,
            targetNodeId: result.target_node_id
          });
          
          return {
            ...result,
            sourceNode: {
              data: result.source_data,
              node_id: result.source_node_id
            },
            targetNode: {
              data: result.target_data,
              node_id: result.target_node_id
            }
          };
        });
        
        return allMatches;
      }
      
      results = await this.model.sequelize.query(`
        SELECT fe.*, 
               fn1.data as source_data, 
               fn2.data as target_data,
               fn1.node_id as source_node_id,
               fn2.node_id as target_node_id
        FROM flow_edges fe
        INNER JOIN flow_nodes fn1 ON fe.source = fn1.node_id
        INNER JOIN flow_nodes fn2 ON fe.target = fn2.node_id
        WHERE fe.flow_id = :flowId 
        AND LOWER(fn1.data::text) LIKE LOWER(:searchPattern)
        ORDER BY fe.id
      `, {
        replacements: { 
          flowId: flowId, 
          searchPattern: `%"value":"${triggerText}"%` 
        },
        type: this.model.sequelize.QueryTypes.SELECT
      });
      
      console.log('🔍 [ALL_MESSAGES] Case-insensitive results:', results.length);
      
      if (results && results.length > 0) {
        const allMatches = results.map(result => {
          console.log('✅ [ALL_MESSAGES] Case-insensitive match:', {
            edgeId: result.id,
            sourceHandle: result.source_handle,
            targetNodeId: result.target_node_id
          });
          
          return {
            ...result,
            sourceNode: {
              data: result.source_data,
              node_id: result.source_node_id
            },
            targetNode: {
              data: result.target_data,
              node_id: result.target_node_id
            }
          };
        });
        
        return allMatches;
      }
      
    } catch (error) {
      console.error('❌ [ALL_MESSAGES] SQL search failed:', error.message);
    }
    
    console.log('❌ [ALL_MESSAGES] No connected messages found for trigger:', triggerText);
    return [];
  }

};

module.exports = FlowEdgeRepository