import { GridRowId, GridRowTreeConfig, GridRowTreeNodeConfig } from '../../models';
import { GridFilterState } from '../../hooks';

interface FilterRowTreeParams {
  rowTree: GridRowTreeConfig;
  disableChildrenFiltering: boolean;
  isRowMatchingFilters: ((rowId: GridRowId) => boolean) | null;
  shouldOnlyCountDescendantLeaf: boolean;
}

/**
 * A node is visible if
 * - One of its children is passing the filter
 * - It is passing the filter
 */
export const filterRowTree = (
  params: FilterRowTreeParams,
): Pick<GridFilterState, 'visibleRowsLookup' | 'filteredDescendantCountLookup'> => {
  const { rowTree, disableChildrenFiltering, isRowMatchingFilters, shouldOnlyCountDescendantLeaf } =
    params;
  const visibleRowsLookup: Record<GridRowId, boolean> = {};
  const filteredDescendantCountLookup: Record<GridRowId, number> = {};

  const filterTreeNode = (
    node: GridRowTreeNodeConfig,
    isParentMatchingFilters: boolean,
    areAncestorsExpanded: boolean,
  ): number => {
    const shouldSkipFilters = disableChildrenFiltering && node.depth > 0;

    let isMatchingFilters: boolean | null;
    if (shouldSkipFilters) {
      isMatchingFilters = null;
    } else if (!isRowMatchingFilters) {
      isMatchingFilters = true;
    } else {
      isMatchingFilters = isRowMatchingFilters(node.id);
    }

    let filteredDescendantCount = 0;
    node.children?.forEach((childId) => {
      const childNode = rowTree[childId];
      const childSubTreeSize = filterTreeNode(
        childNode,
        isMatchingFilters ?? isParentMatchingFilters,
        areAncestorsExpanded && !!node.childrenExpanded,
      );

      filteredDescendantCount += childSubTreeSize;
    });

    let shouldPassFilters: boolean;
    switch (isMatchingFilters) {
      case true: {
        shouldPassFilters = true;
        break;
      }
      case false: {
        shouldPassFilters = filteredDescendantCount > 0;
        break;
      }
      default: {
        shouldPassFilters = isParentMatchingFilters;
        break;
      }
    }

    visibleRowsLookup[node.id] = shouldPassFilters && areAncestorsExpanded;

    if (!shouldPassFilters) {
      return 0;
    }

    filteredDescendantCountLookup[node.id] = filteredDescendantCount;

    if (shouldOnlyCountDescendantLeaf && filteredDescendantCount > 0) {
      return filteredDescendantCount;
    }

    return filteredDescendantCount + 1;
  };

  const nodes = Object.values(rowTree);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.depth === 0) {
      filterTreeNode(node, true, true);
    }
  }

  return {
    visibleRowsLookup,
    filteredDescendantCountLookup,
  };
};
