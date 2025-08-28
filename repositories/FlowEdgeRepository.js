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
    
    // Use raw SQL to search JSON data in PostgreSQL
    try {
      // First try exact match
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
      
      if (results && results.length > 0) {
        const result = results[0];
        // Convert raw result to match expected structure
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
      
      // If no exact match, try case-insensitive search
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
      
      if (results && results.length > 0) {
        const result = results[0];
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
      console.error('Edge search failed:', error.message);
    }
    
    // Fallback: look for edges where source_handle contains the trigger text
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source_handle: {
          [Op.like]: `%${triggerText}%`
        }
      },
      include: ["targetNode"],
    });
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

};

module.exports = FlowEdgeRepository