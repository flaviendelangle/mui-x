import * as React from 'react';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { GridComponentProps } from '../../../GridComponentProps';
import {
  GRID_TREE_DATA_GROUP_COL_DEF,
  GRID_TREE_DATA_GROUP_COL_DEF_FORCED_PROPERTIES,
} from './gridTreeDataGroupColDef';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEventListener, GridEvents } from '../../../models/events';
import { GridColDef, GridColDefOverrideParams } from '../../../models';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { useFirstRender } from '../../utils/useFirstRender';
import { buildRowTree, BuildRowTreeGroupingCriteria } from '../../../utils/tree/buildRowTree';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { gridFilteredDescendantCountLookupSelector } from '../filter';
import { GridPreProcessingGroup, useGridRegisterPreProcessor } from '../../core/preProcessing';
import { GridColumnsRawState } from '../columns/gridColumnsState';
import { GridFilteringMethod } from '../filter/gridFilterState';
import { gridRowIdsSelector, gridRowTreeSelector } from '../rows';
import { filterRowTree } from '../../../utils/tree/filterRowTree';
import { useGridRegisterFilteringMethod } from '../filter/useGridRegisterFilteringMethod';
import { useGridRegisterSortingMethod } from '../sorting/useGridRegisterSortingMethod';
import { GridSortingMethod } from '../sorting/gridSortingState';
import { sortRowTree } from '../../../utils/tree/sortRowTree';

const TREE_DATA_GROUPING_NAME = 'tree-data';

/**
 * Only available in DataGridPro
 * @requires useGridPreProcessing (method)
 * @requires useGridRowGroupsPreProcessing (method)
 */
export const useGridTreeData = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    | 'treeData'
    | 'getTreeDataPath'
    | 'groupingColDef'
    | 'defaultGroupingExpansionDepth'
    | 'disableChildrenFiltering'
    | 'disableChildrenSorting'
  >,
) => {
  /**
   * ROW GROUPING
   */
  const updateRowGrouping = React.useCallback(() => {
    if (!props.treeData) {
      return apiRef.current.unstable_registerRowGroupsBuilder('treeData', null);
    }

    const groupRows: GridRowGroupingPreProcessing = (params) => {
      if (!props.getTreeDataPath) {
        throw new Error('MUI: No getTreeDataPath given.');
      }

      const rows = params.ids
        .map((rowId) => ({
          id: rowId,
          path: props.getTreeDataPath!(params.idRowsLookup[rowId]).map(
            (key): BuildRowTreeGroupingCriteria => ({ key, field: null }),
          ),
        }))
        .sort((a, b) => a.path.length - b.path.length);

      return buildRowTree({
        rows,
        ...params,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
        treeGroupingName: TREE_DATA_GROUPING_NAME,
      });
    };

    return apiRef.current.unstable_registerRowGroupsBuilder('treeData', groupRows);
  }, [apiRef, props.getTreeDataPath, props.treeData, props.defaultGroupingExpansionDepth]);

  useFirstRender(() => {
    updateRowGrouping();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateRowGrouping();
  }, [updateRowGrouping]);

  /**
   * PRE-PROCESSING
   */
  const groupingColDef = React.useMemo<GridColDef>(() => {
    const propGroupingColDef = props.groupingColDef;

    const baseColDef: Omit<GridColDef, 'field' | 'editable'> = {
      ...GRID_TREE_DATA_GROUP_COL_DEF,
      headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
    };
    let colDefOverride: Partial<GridColDef>;

    if (typeof propGroupingColDef === 'function') {
      const params: GridColDefOverrideParams = {
        sources: [],
      };

      colDefOverride = propGroupingColDef(params);
    } else {
      colDefOverride = propGroupingColDef ?? {};
    }

    return {
      ...baseColDef,
      ...colDefOverride,
      ...GRID_TREE_DATA_GROUP_COL_DEF_FORCED_PROPERTIES,
    };
  }, [apiRef, props.groupingColDef]);

  const updateGroupingColumn = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      const shouldHaveGroupingColumn = props.treeData;
      const haveGroupingColumn = columnsState.lookup[groupingColDef.field] != null;
      const index = columnsState.all[0] === '__check__' ? 1 : 0;

      if (shouldHaveGroupingColumn && !haveGroupingColumn) {
        columnsState.lookup[groupingColDef.field] = groupingColDef;
        columnsState.all = [
          ...columnsState.all.slice(0, index),
          groupingColDef.field,
          ...columnsState.all.slice(index),
        ];
      } else if (!shouldHaveGroupingColumn && haveGroupingColumn) {
        delete columnsState.lookup[groupingColDef.field];
        columnsState.all = columnsState.all.filter((field) => field !== groupingColDef.field);
      }

      return columnsState;
    },
    [props.treeData, groupingColDef],
  );

  const filteringMethod = React.useCallback<GridFilteringMethod>(
    (params) => {
      const rowTree = gridRowTreeSelector(apiRef.current.state);

      return filterRowTree({
        rowTree,
        isRowMatchingFilters: params.isRowMatchingFilters,
        disableChildrenFiltering: props.disableChildrenFiltering,
        shouldOnlyCountDescendantLeaf: false,
      });
    },
    [apiRef, props.disableChildrenFiltering],
  );

  const sortingMethod = React.useCallback<GridSortingMethod>(
    (params) => {
      const rowTree = gridRowTreeSelector(apiRef.current.state);
      const rowIds = gridRowIdsSelector(apiRef.current.state);

      return sortRowTree({
        rowTree,
        rowIds,
        sortRowList: params.sortRowList,
        comparatorList: params.comparatorList,
        disableChildrenSorting: props.disableChildrenSorting,
      });
    },
    [apiRef, props.disableChildrenSorting],
  );

  useGridRegisterPreProcessor(apiRef, GridPreProcessingGroup.hydrateColumns, updateGroupingColumn);
  useGridRegisterFilteringMethod(apiRef, TREE_DATA_GROUPING_NAME, filteringMethod);
  useGridRegisterSortingMethod(apiRef, TREE_DATA_GROUPING_NAME, sortingMethod);

  /**
   * EVENTS
   */
  const handleCellKeyDown = React.useCallback<GridEventListener<GridEvents.cellKeyDown>>(
    (params, event) => {
      const cellParams = apiRef.current.getCellParams(params.id, params.field);
      if (cellParams.colDef.type === 'treeDataGroup' && isSpaceKey(event.key) && !event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();

        const filteredDescendantCount =
          gridFilteredDescendantCountLookupSelector(apiRef.current.state)[params.id] ?? 0;

        if (filteredDescendantCount === 0) {
          return;
        }

        apiRef.current.setRowChildrenExpansion(params.id, !params.rowNode.childrenExpanded);
      }
    },
    [apiRef],
  );

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
};
