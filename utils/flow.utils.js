function formatEdgesForFlow(edges) {
    return edges.map((edge) => {
        return {
            id: edge.edge_id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.source_handle,
            targetHandle: edge.target_handle
        }
    })
}

function formatNodesForFlow(nodes) {
    return nodes.map((node) => {
        return {
            id: node.node_id,
            type: node.node_type,
            data: node.data,
            position: node.position,
            position_absolute: node.position_absolute,
            nodeType: node.node_type
        }
    })
}

module.exports = { formatEdgesForFlow, formatNodesForFlow };