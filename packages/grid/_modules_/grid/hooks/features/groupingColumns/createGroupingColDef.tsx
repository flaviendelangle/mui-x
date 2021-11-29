import * as React from 'react';
import {
  GRID_STRING_COL_DEF,
  GridApiRef,
  GridColDef,
  GridGroupingColDefOverride,
  GridRenderCellParams,
  GridStateColDef,
} from '../../../models';
import { GridColumnRawLookup } from '../columns/gridColumnsState';
import { GridRowGroupByColumnsGroupingCell } from '../../../components/cell/GridRowGroupByColumnsGroupingCell';
import { getGroupingColDefField } from './gridGroupingColumnsUtils';

const GROUPING_COL_DEF_DEFAULT_VALUES: Partial<GridColDef> = {
  ...GRID_STRING_COL_DEF,
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
export const createGroupingColDefForOneGroupingCriteria = ({
  columnsLookup,
  groupedByColDef,
  groupedByField,
  colDefOverride,
}: CreateGroupingColDefMonoCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, ...colDefOverrideProperties } = colDefOverride;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // If we have a `mainGroupingCriteria` defined and matching the `groupedByField`
  // Then we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `groupedByColDef`.
  // It can be useful to define a `leafField` for leaves rendering but still use the grouping criteria for the sorting / filtering
  //
  // If we have a `leafField` defined and matching an existing column
  // Then we apply the sorting / filtering on the leaves based on the properties of `leavesColDef`
  //
  // By default, we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `groupedColDef`.
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingCriteria && mainGroupingCriteria === groupedByField) {
    sourceProperties = getGroupingCriteriaProperties(groupedByColDef);
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(groupedByColDef);
  }

  // The properties that do not depend on the presence of a `leafColDef` and that can be override by `colDefOverride`
  const commonProperties: Partial<GridColDef> = {
    width: Math.max(
      (groupedByColDef.width ?? GRID_STRING_COL_DEF.width!) + 40,
      leafColDef?.width ?? 0,
    ),
    renderCell: (params: GridRenderCellParams) => {
      if (params.rowNode.groupingField !== groupedByField) {
        return null;
      }

      return <GridRowGroupByColumnsGroupingCell {...params} />;
    },
    valueGetter: (params) => {
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
    field: getGroupingColDefField(groupedByField),
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
  groupingColumnsModel: string[];

  /**
   * The col def properties the user wants to override.
   */
  colDefOverride: GridGroupingColDefOverride;
}

/**
 * Creates the `GridColDef` for a grouping column that only takes car of a single grouping criteria
 * TODO: Handle valueFormatter
 */
export const createGroupingColDefForAllGroupingCriteria = ({
  apiRef,
  columnsLookup,
  groupingColumnsModel,
  colDefOverride,
}: CreateGroupingColDefSeveralCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, ...colDefOverrideProperties } = colDefOverride;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // If we have a `mainGroupingCriteria` defined and matching one of the `orderedGroupedByFields`
  // Then we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `columnsLookup[mainGroupingCriteria]`.
  // It can be useful to use another grouping criteria than the top level one for the sorting / filtering
  //
  // If we have a `leafField` defined and matching an existing column
  // Then we apply the sorting / filtering on the leaves based on the properties of `leavesColDef`
  //
  // By default, we apply the sorting / filtering on the groups of the top level grouping criteria based on the properties of `columnsLookup[orderedGroupedByFields[0]]`.
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingCriteria && groupingColumnsModel.includes(mainGroupingCriteria)) {
    sourceProperties = getGroupingCriteriaProperties(columnsLookup[mainGroupingCriteria]);
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(columnsLookup[groupingColumnsModel[0]]);
  }

  // The properties that do not depend on the presence of a `leafColDef` and that can be override by `colDefOverride`
  const baseColDef: Partial<GridColDef> = {
    headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
    width: Math.max(
      ...groupingColumnsModel.map(
        (field) => (columnsLookup[field].width ?? GRID_STRING_COL_DEF.width!) + 40,
      ),
      leafColDef?.width ?? 0,
    ),
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
    field: getGroupingColDefField(null),
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
