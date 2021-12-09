import {
  GridColDef,
  GridRowId,
  GridRowTreeConfig,
  GridRowTreeNodeConfig,
  GridStateColDef,
  GridValueGetterSimpleParams,
} from '../../../models';
import { GridFilterState } from '../filter';
import { GridComponentProps } from '../../../GridComponentProps';

export const GROUPING_COLUMN_SINGLE = '__row_group_by_columns_group__';

export const GROUPING_COLUMNS_FEATURE_NAME = 'grouping-columns';

export const getGroupingColDefFieldFromGroupingCriteriaField = (
  groupingCriteria: string | null,
) => {
  if (groupingCriteria === null) {
    return GROUPING_COLUMN_SINGLE;
  }

  return `__row_group_by_columns_group_${groupingCriteria}__`;
};

export const getGroupingCriteriaFieldFromGroupingColDefField = (groupingColDefField: string) => {
  const match = groupingColDefField.match(/^__row_group_by_columns_group_(.*)__$/);

  if (!match) {
    return null;
  }

  return match[1];
};

export const isGroupingColumn = (field: string) =>
  field === GROUPING_COLUMN_SINGLE ||
  getGroupingCriteriaFieldFromGroupingColDefField(field) !== null;

interface FilterRowTreeFromTreeDataParams {
  rowTree: GridRowTreeConfig;
  isRowMatchingFilters: ((rowId: GridRowId) => boolean) | null;
}

/**
 * A node is visible if one all the following criteria are met:
 * - One of its children is passing the filter
 * - It is passing the filter
 */
export const filterRowTreeFromGroupingColumns = (
  params: FilterRowTreeFromTreeDataParams,
): Pick<GridFilterState, 'visibleRowsLookup' | 'filteredDescendantCountLookup'> => {
  const { rowTree, isRowMatchingFilters } = params;
  const visibleRowsLookup: Record<GridRowId, boolean> = {};
  const filteredDescendantCountLookup: Record<GridRowId, number> = {};

  const filterTreeNode = (
    node: GridRowTreeNodeConfig,
    areAncestorsPassingChildren: boolean,
    areAncestorsExpanded: boolean,
  ): number => {
    let isMatchingFilters: boolean;
    if (!isRowMatchingFilters) {
      isMatchingFilters = true;
    } else {
      isMatchingFilters = isRowMatchingFilters(node.id);
    }

    let filteredDescendantCount = 0;
    node.children?.forEach((childId) => {
      const childNode = rowTree[childId];
      const childSubTreeSize = filterTreeNode(
        childNode,
        areAncestorsPassingChildren && isMatchingFilters,
        areAncestorsExpanded && !!node.childrenExpanded,
      );
      filteredDescendantCount += childSubTreeSize;
    });

    let shouldPassFilters: boolean;
    if (!areAncestorsPassingChildren) {
      shouldPassFilters = false;
    } else if (node.children?.length) {
      shouldPassFilters = isMatchingFilters && filteredDescendantCount > 0;
    } else {
      shouldPassFilters = isMatchingFilters;
    }

    visibleRowsLookup[node.id] = shouldPassFilters && areAncestorsExpanded;

    if (!shouldPassFilters) {
      return 0;
    }

    filteredDescendantCountLookup[node.id] = filteredDescendantCount;

    if (!node.children) {
      return filteredDescendantCount + 1;
    }

    return filteredDescendantCount;
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

export const getColDefOverrides = (
  propGroupingColDef: GridComponentProps['groupingColDef'],
  fields: string[],
) => {
  if (typeof propGroupingColDef === 'function') {
    return propGroupingColDef({
      groupingName: GROUPING_COLUMNS_FEATURE_NAME,
      fields,
    });
  }

  return propGroupingColDef;
};
