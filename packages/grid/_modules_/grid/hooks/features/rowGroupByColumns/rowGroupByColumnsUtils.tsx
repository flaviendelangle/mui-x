import * as React from 'react';
import { GridColumnLookup, GridColumnRawLookup } from '../columns/gridColumnsState';
import {
  GridApiRef,
  GridColDef,
  GridGroupingColDefOverride,
  GridRenderCellParams,
  GridStateColDef,
} from '../../../models';
import { GridRowGroupByColumnsGroupingCell } from '../../../components/cell/GridRowGroupByColumnsGroupingCell';

export const getRowGroupingColumnLookup = <V extends GridColumnLookup | GridColumnRawLookup>(
  lookup: V,
) => {
  const groupingColumns = {} as V;
  Object.keys(lookup).forEach((key) => {
    if (lookup[key].groupRows) {
      groupingColumns[key] = lookup[key];
    }
  });

  return groupingColumns;
};

export const orderGroupedByFields = (groupingColumns: GridColumnRawLookup) => {
  const unOrderedGroupingFields = Object.keys(groupingColumns);
  const shouldApplyExplicitGroupOrder = unOrderedGroupingFields.some(
    (field) => groupingColumns[field].groupRowIndex != null,
  );

  if (!shouldApplyExplicitGroupOrder) {
    return unOrderedGroupingFields;
  }

  const fieldInitialIndex = Object.fromEntries(
    unOrderedGroupingFields.map((field, fieldIndex) => [field, fieldIndex]),
  );

  return unOrderedGroupingFields.sort((a, b) => {
    const colA = groupingColumns[a];
    const colB = groupingColumns[b];

    if (colA.groupRowIndex == null && colB.groupRowIndex != null) {
      return -1;
    }

    if (colA.groupRowIndex != null && colB.groupRowIndex == null) {
      return 1;
    }

    if (colA.groupRowIndex != null && colB.groupRowIndex != null) {
      return colA.groupRowIndex - colB.groupRowIndex;
    }

    return fieldInitialIndex[a] - fieldInitialIndex[b];
  });
};

const GROUPING_COL_DEF_DEFAULT_VALUES: Partial<GridColDef> = {
  type: 'rowGroupByColumnsGroup',
  disableReorder: true,
  hide: false,
  align: 'left',
  headerAlign: 'left',
};

const getLeafProperties = (leafColDef: GridColDef): Partial<GridColDef> => ({
  headerName: leafColDef.headerName ?? leafColDef.field,
  sortable: leafColDef.sortable,
  filterable: leafColDef.filterable,
  filterOperators: leafColDef.filterOperators?.map((operator) => ({
    ...operator,
    getApplyFilterFn: (filterItem, column) => {
      const originalFn = operator.getApplyFilterFn(filterItem, column);
      if (!originalFn) {
        return null;
      }

      return (params) => {
        // We only want to filter leaves
        if (params.rowNode.groupingField != null) {
          return true;
        }

        return originalFn(params);
      };
    },
  })),
  sortComparator: (v1, v2, cellParams1, cellParams2) => {
    // We only want to sort leaves
    if (cellParams1.rowNode.groupingField != null) {
      return 0;
    }

    return leafColDef.sortComparator!(v1, v2, cellParams1, cellParams2);
  },
});

const getGroupingCriteriaProperties = (groupedByColDef: GridColDef): Partial<GridColDef> => ({
  headerName: groupedByColDef.headerName ?? groupedByColDef.field,
  sortable: groupedByColDef.sortable,
  filterable: groupedByColDef.filterable,
  sortComparator: (v1, v2, cellParams1, cellParams2) => {
    // We only want to sort the groups of the current grouping criteria
    if (cellParams1.rowNode.groupingField !== groupedByColDef.field) {
      return 0;
    }

    return groupedByColDef.sortComparator!(v1, v2, cellParams1, cellParams2);
  },
  filterOperators: groupedByColDef.filterOperators?.map((operator) => ({
    ...operator,
    getApplyFilterFn: (filterItem, column) => {
      const originalFn = operator.getApplyFilterFn(filterItem, column);
      if (!originalFn) {
        return null;
      }

      return (params) => {
        // We only want to filter the groups of the current grouping criteria
        if (params.rowNode.groupingField !== groupedByColDef.field) {
          return true;
        }

        return originalFn(params);
      };
    },
  })),
});

interface CreateGroupingColDefMonoCriteriaParams {
  columnsLookup: GridColumnRawLookup;

  /**
   * The field from which we are grouping the rows
   */
  groupedByField: string;

  /**
   * The col def from which we are grouping the rows
   */
  groupedByColDef: GridColDef | GridStateColDef;

  /**
   * The col def properties the user wants to override.
   * This value comes prop `prop.groupingColDef`
   */
  colDefOverride: GridGroupingColDefOverride;
}

/**
 * Creates the `GridColDef` for a grouping column that only takes car of a single grouping criteria
 * TODO: Handle valueFormatter
 */
export const createGroupingColDefMonoCriteria = ({
  columnsLookup,
  groupedByColDef,
  groupedByField,
  colDefOverride,
}: CreateGroupingColDefMonoCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, ...colDefOverrideProperties } = colDefOverride;
  const mainGroupingColDef = mainGroupingCriteria ? columnsLookup[mainGroupingCriteria] : null;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // If we have a `leafColDef`, we apply the sorting and the filtering on the leaves based on this `leafColDef` properties
  // If not, we apply the sorting and the filtering on the groups of the current grouping criteria based on the `groupedColDef` properties.
  // TODO: Fix comment
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingColDef) {
    if (mainGroupingColDef.field === groupedByField) {
      sourceProperties = getGroupingCriteriaProperties(mainGroupingColDef);
    } else {
      sourceProperties = { filterable: false, sortable: false };
    }
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(groupedByColDef);
  }

  // The properties that do not depend on the presence of a `leafColDef` and that can be override by `colDefOverride`
  const commonProperties: Partial<GridColDef> = {
    renderCell: (params: GridRenderCellParams) => {
      if (params.rowNode.groupingField !== groupedByField) {
        return null;
      }

      return <GridRowGroupByColumnsGroupingCell {...params} />;
    },
    valueGetter: (params) => {
      if (params.rowNode.groupingField == null) {
        return params.value;
      }

      if (params.rowNode.groupingField === groupedByField) {
        return params.rowNode.groupingKey;
      }

      if (params.rowNode.groupingField == null && leafColDef) {
        return params.api.getCellValue(params.id, leafColDef.field);
      }

      return undefined;
    },
  };

  // The properties that can't be override with `colDefOverride`
  const forcedProperties: Pick<GridColDef, 'field' | 'editable'> = {
    field: `__row_group_by_columns_group_${groupedByField}__`,
    editable: false,
  };

  return {
    ...GROUPING_COL_DEF_DEFAULT_VALUES,
    ...sourceProperties,
    ...commonProperties,
    ...colDefOverrideProperties,
    ...forcedProperties,
  };
};

interface CreateGroupingColDefSeveralCriteriaParams {
  apiRef: GridApiRef;
  columnsLookup: GridColumnRawLookup;

  /**
   * The fields from which we are grouping the rows
   */
  orderedGroupedByFields: string[];

  /**
   * The col def properties the user wants to override.
   */
  colDefOverride: GridGroupingColDefOverride;
}

/**
 * Creates the `GridColDef` for a grouping column that only takes car of a single grouping criteria
 * TODO: Handle valueFormatter
 */
export const createGroupingColDefSeveralCriteria = ({
  apiRef,
  columnsLookup,
  orderedGroupedByFields,
  colDefOverride,
}: CreateGroupingColDefSeveralCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, ...colDefOverrideProperties } = colDefOverride;
  const mainGroupingColDef = mainGroupingCriteria ? columnsLookup[mainGroupingCriteria] : null;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // If we have a `leafColDef`, we apply the sorting and the filtering on the leaves based on this `leafColDef` properties
  // If not, we apply the sorting and the filtering on the groups of the top level grouping criteria based on the `groupedColDef` properties.
  // TODO: Fix comment
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingColDef) {
    if (orderedGroupedByFields.includes(mainGroupingColDef.field)) {
      sourceProperties = getGroupingCriteriaProperties(mainGroupingColDef);
    } else {
      sourceProperties = { filterable: false, sortable: false };
    }
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(columnsLookup[orderedGroupedByFields[0]]);
  }

  // The properties that do not depend on the presence of a `leafColDef` and that can be override by `colDefOverride`
  const baseColDef: Partial<GridColDef> = {
    headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
    renderCell: (params) => {
      if (params.rowNode.groupingField == null) {
        return params.value;
      }

      return <GridRowGroupByColumnsGroupingCell {...params} />;
    },
    valueGetter: (params) => {
      if (params.rowNode.groupingField != null) {
        return params.rowNode.groupingKey;
      }

      if (leafColDef) {
        return params.api.getCellValue(params.id, leafColDef.field);
      }

      return undefined;
    },
  };

  // The properties that can't be override with `colDefOverride`
  const forcedProperties: Pick<GridColDef, 'field' | 'editable'> = {
    field: '__row_group_by_columns_group__',
    editable: false,
  };

  return {
    ...GROUPING_COL_DEF_DEFAULT_VALUES,
    ...sourceProperties,
    ...baseColDef,
    ...colDefOverrideProperties,
    ...forcedProperties,
  };
};
