import {uniq} from 'lodash';

export interface GraphEdge<NodeType> {
  node1: NodeType;
  node2: NodeType;
}

export function nodeGroups<NodeType, EdgeType extends GraphEdge<NodeType>>(params: {
  nodes: NodeType[];
  edges: EdgeType[];
}): NodeType[][] {
  const {nodes, edges} = params;
  const groups = new Map<NodeType, Set<NodeType>>();

  nodes.forEach((node) => {
    groups.set(
      node,
      new Set<NodeType>([node])
    );
  });

  edges.forEach((edge: EdgeType) => {
    const {node1, node2} = edge;
    const node1Set = groups.get(node1);
    const node2Set = groups.get(node2);
    if (node1Set && node2Set && node1Set !== node2Set) {
      // Add all elements in set 2 to set 1
      const combinedSet = node1Set;
      node2Set.forEach((node) => node1Set.add(node));
      combinedSet.forEach((node) => {
        groups.set(node, combinedSet);
      });
    }
  });

  return uniq(Array.from(groups.values())).map((set) => Array.from(set));
}
