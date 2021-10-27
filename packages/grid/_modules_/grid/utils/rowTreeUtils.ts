import type { GridRowTreeNodeConfig, GridRowId, GridRowTreeConfig } from '../models';
import type {
  GridRowGroupingResult,
  GridRowGroupParams,
} from '../hooks/core/rowGroupsPerProcessing';

type GridNodeNameToIdTree = {
  [nodeName: string]: { id: GridRowId; children: GridNodeNameToIdTree };
};

interface GenerateRowTreeParams extends GridRowGroupParams {
  rows: { id: GridRowId; path: string[] }[];
  defaultGroupingExpansionDepth: number;
}

interface TempRowTreeNode extends Omit<GridRowTreeNodeConfig, 'children'> {
  children?: Record<GridRowId, GridRowId>;
}

/**
 * Transform a list of rows into a tree structure where each row references its parent and children.
 * Add the auto generated rows to `ids` and `idRowsLookup`.
 */
export const buildRowTree = (params: GenerateRowTreeParams): GridRowGroupingResult => {
  // During the build, we store the children as a Record to avoid linear complexity when checking if a children is already defined.
  const tempTree: Record<GridRowId, TempRowTreeNode> = {};
  let treeDepth = 1;

  const ids = [...params.ids];
  const idRowsLookup = { ...params.idRowsLookup };

  const nodeNameToIdTree: GridNodeNameToIdTree = {};

  for (let i = 0; i < params.rows.length; i += 1) {
    const row = params.rows[i];
    let nodeNameToIdSubTree = nodeNameToIdTree;
    let parentNode: TempRowTreeNode | null = null;

    for (let depth = 0; depth < row.path.length; depth += 1) {
      const nodeName = row.path[depth];
      let nodeId: GridRowId;

      const expanded =
        params.defaultGroupingExpansionDepth === -1 || params.defaultGroupingExpansionDepth > depth;

      let nodeNameConfig = nodeNameToIdSubTree[nodeName];

      if (!nodeNameConfig) {
        nodeId =
          depth === row.path.length - 1
            ? row.id
            : `auto-generated-row-${row.path.slice(0, depth + 1).join('-')}`;

        nodeNameConfig = { id: nodeId, children: {} };
        nodeNameToIdSubTree[nodeName] = nodeNameConfig;
      } else {
        nodeId = nodeNameConfig.id;
      }
      nodeNameToIdSubTree = nodeNameConfig.children;

      if (depth < row.path.length - 1) {
        let node = tempTree[nodeId] ?? null;
        if (!node) {
          node = {
            id: nodeId,
            isAutoGenerated: true,
            expanded,
            parent: parentNode?.id ?? null,
            groupingValue: row.path[depth],
            depth,
          };

          tempTree[nodeId] = node;
          idRowsLookup[nodeId] = {};
          ids.push(nodeId);
        }
      } else {
        tempTree[row.id] = {
          id: row.id,
          expanded,
          parent: parentNode?.id ?? null,
          groupingValue: row.path[depth],
          depth,
        };
      }

      if (parentNode != null) {
        if (!parentNode.children) {
          parentNode.children = {};
        }

        parentNode.children[nodeId] = nodeId;
      }

      parentNode = tempTree[nodeId]!;
    }

    treeDepth = Math.max(treeDepth, row.path.length);
  }

  const tree: GridRowTreeConfig = {};
  for (let i = 0; i < ids.length; i += 1) {
    const rowId = ids[i];
    const tempNode = tempTree[rowId];
    tree[rowId] = {
      ...tempNode,
      children: tempNode.children ? Object.values(tempNode.children) : undefined,
    };
  }

  return {
    tree,
    treeDepth,
    ids,
    idRowsLookup,
  };
};
