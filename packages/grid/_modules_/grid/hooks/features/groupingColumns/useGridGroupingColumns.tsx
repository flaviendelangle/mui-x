import * as React from 'react';
import type {
  GridApiRef,
  GridRowModel,
  GridRowId,
  GridColDef,
  GridKeyValue,
} from '../../../models';
import { GridEvents, GridEventListener } from '../../../models/events';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { buildRowTree, BuildRowTreeGroupingCriteria } from '../../../utils/tree/buildRowTree';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import {
  gridGroupingRowsModelSelector,
  gridGroupingRowsSanitizedModelSelector,
} from './gridGroupingColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { getGroupingColDefField } from './gridGroupingColumnsUtils';
import {
  createGroupingColDefForOneGroupingCriteria,
  createGroupingColDefForAllGroupingCriteria,
} from './createGroupingColDef';
import { isDeepEqual, isFunction } from '../../../utils/utils';
import { GridPreProcessingGroup, useGridRegisterPreProcessor } from '../../core/preProcessing';
import { GridColumnsRawState } from '../columns/gridColumnsState';
import { useGridRegisterFilteringMethod } from '../filter/useGridRegisterFilteringMethod';
import { GridFilteringMethod } from '../filter/gridFilterState';
import { gridRowIdsSelector, gridRowTreeSelector } from '../rows';
import { filterRowTree } from '../../../utils/tree/filterRowTree';
import { useGridRegisterSortingMethod } from '../sorting/useGridRegisterSortingMethod';
import { GridSortingMethod } from '../sorting/gridSortingState';
import { sortRowTree } from '../../../utils/tree/sortRowTree';
import { gridFilteredDescendantCountLookupSelector } from '../filter';
import { useGridStateInit } from '../../utils/useGridStateInit';
import { GridGroupingColumnsApi, GridGroupingColumnsModel } from './gridGroupingColumnsInterfaces';
import { useGridApiMethod, useGridState } from '../../utils';
import { gridColumnLookupSelector } from '../columns';

const GROUP_ROWS_BY_COLUMN_NAME = 'group-rows-by-columns';

/**
 * Only available in DataGridPro
 * TODO: Add requirements
 */
export const useGridGroupingColumns = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    | 'initialState'
    | 'groupingColumnsModel'
    | 'onGroupingColumnsModelChange'
    | 'defaultGroupingExpansionDepth'
    | 'groupingColDef'
    | 'groupingColumnMode'
    | 'disableChildrenFiltering'
    | 'disableChildrenSorting'
  >,
) => {
  useGridStateInit(apiRef, (state) => ({
    ...state,
    groupingColumns: {
      model: props.groupingColumnsModel ?? props.initialState?.groupingColumns?.model ?? [],
    },
  }));

  const [, setGridState, forceUpdate] = useGridState(apiRef);

  apiRef.current.unstable_updateControlState({
    stateId: 'groupingColumns',
    propModel: props.groupingColumnsModel,
    propOnChange: props.onGroupingColumnsModelChange,
    stateSelector: gridGroupingRowsModelSelector,
    changeEvent: GridEvents.groupingColumnsModelChange,
  });

  /**
   * ROW GROUPING
   */
  const sanitizedGroupingColumnsModelOnLastRowPreProcessing =
    React.useRef<GridGroupingColumnsModel>();

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumnsModel = gridGroupingRowsSanitizedModelSelector(apiRef.current.state);
      const columnsLookup = gridColumnLookupSelector(apiRef.current.state);
      sanitizedGroupingColumnsModelOnLastRowPreProcessing.current = groupingColumnsModel;

      if (groupingColumnsModel.length === 0) {
        return null;
      }

      const distinctValues: { [field: string]: { map: { [val: string]: boolean }; list: any[] } } =
        Object.fromEntries(
          groupingColumnsModel.map((groupingField) => [groupingField, { map: {}, list: [] }]),
        );

      const getCellGroupingCriteria = ({
        row,
        id,
        colDef,
        field,
      }: {
        row: GridRowModel;
        id: GridRowId;
        colDef: GridColDef;
        field: string;
      }): BuildRowTreeGroupingCriteria => {
        // TODO: Handle valueGetter
        let key: GridKeyValue;
        if (colDef.keyGetter) {
          key = colDef.keyGetter({
            value: row[field],
            id,
            field,
          });
        } else {
          key = row[field] as GridKeyValue;
        }

        return {
          key,
          field,
        };
      };

      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];

        groupingColumnsModel.forEach((groupedByField) => {
          const { key } = getCellGroupingCriteria({
            row,
            id: rowId,
            colDef: columnsLookup[groupedByField],
            field: groupedByField,
          });
          const groupingFieldsDistinctKeys = distinctValues[groupedByField];

          if (key != null && !groupingFieldsDistinctKeys.map[key.toString()]) {
            groupingFieldsDistinctKeys.map[key.toString()] = true;
            groupingFieldsDistinctKeys.list.push(key);
          }
        });
      });

      const rows = params.ids.map((rowId) => {
        const row = params.idRowsLookup[rowId];
        const parentPath = groupingColumnsModel
          .map((groupingField) =>
            getCellGroupingCriteria({
              row,
              id: rowId,
              colDef: columnsLookup[groupingField],
              field: groupingField,
            }),
          )
          .filter((cell) => cell.key != null);

        return {
          path: [...parentPath, { key: rowId.toString(), field: null }],
          id: rowId,
        };
      });

      return buildRowTree({
        ...params,
        rows,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
        treeGroupingName: GROUP_ROWS_BY_COLUMN_NAME,
      });
    };

    return apiRef.current.unstable_registerRowGroupsBuilder('rowGrouping', groupRows);
  }, [apiRef, props.defaultGroupingExpansionDepth]);

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
  const getGroupingColDefs = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      const propGroupingColDef = props.groupingColDef;

      // We can't use `gridGroupingRowsSanitizedModelSelector` here because the new columns are not in the state yet
      const groupingColumnsModel = gridGroupingRowsModelSelector(apiRef.current.state).filter(
        (field) => !!columnsState.lookup[field],
      );

      if (groupingColumnsModel.length === 0) {
        return [];
      }

      switch (props.groupingColumnMode) {
        case 'single': {
          const colDefOverride = isFunction(propGroupingColDef)
            ? propGroupingColDef({
                sources: groupingColumnsModel.map((field) => columnsState.lookup[field]),
              })
            : propGroupingColDef ?? {};

          return [
            createGroupingColDefForAllGroupingCriteria({
              apiRef,
              groupingColumnsModel,
              colDefOverride,
              columnsLookup: columnsState.lookup,
            }),
          ];
        }

        case 'multiple': {
          return groupingColumnsModel.map((groupedByField) => {
            const groupedByColDef = columnsState.lookup[groupedByField];

            const colDefOverride = isFunction(propGroupingColDef)
              ? propGroupingColDef({
                  sources: [groupedByColDef],
                })
              : propGroupingColDef ?? {};

            return createGroupingColDefForOneGroupingCriteria({
              groupedByField,
              groupedByColDef,
              colDefOverride,
              columnsLookup: columnsState.lookup,
            });
          });
        }

        default: {
          return [];
        }
      }
    },
    [apiRef, props.groupingColDef, props.groupingColumnMode],
  );

  const updateGroupingColumn = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      const groupingColDefs = getGroupingColDefs(columnsState);

      // We remove the grouping columns
      const newColumnFields: string[] = [];
      columnsState.all.forEach((field) => {
        if (columnsState.lookup[field].type === 'rowGroupByColumnsGroup') {
          delete columnsState.lookup[field];
        } else {
          newColumnFields.push(field);
        }
      });
      columnsState.all = newColumnFields;

      // We add the grouping column
      groupingColDefs.forEach((groupingColDef) => {
        columnsState.lookup[groupingColDef.field] = groupingColDef;
      });
      const startIndex = columnsState.all[0] === '__check__' ? 1 : 0;
      columnsState.all = [
        ...columnsState.all.slice(0, startIndex),
        ...groupingColDefs.map((colDef) => colDef.field),
        ...columnsState.all.slice(startIndex),
      ];

      return columnsState;
    },
    [getGroupingColDefs],
  );

  const filteringMethod = React.useCallback<GridFilteringMethod>(
    (params) => {
      const rowTree = gridRowTreeSelector(apiRef.current.state);

      return filterRowTree({
        rowTree,
        isRowMatchingFilters: params.isRowMatchingFilters,
        disableChildrenFiltering: props.disableChildrenFiltering,
        shouldOnlyCountDescendantLeaf: true,
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
  useGridRegisterFilteringMethod(apiRef, GROUP_ROWS_BY_COLUMN_NAME, filteringMethod);
  useGridRegisterSortingMethod(apiRef, GROUP_ROWS_BY_COLUMN_NAME, sortingMethod);

  /**
   * API METHODS
   */
  const setGroupingColumnsModel = React.useCallback<
    GridGroupingColumnsApi['setGroupingColumnsModel']
  >(
    (model) => {
      const currentModel = gridGroupingRowsModelSelector(apiRef.current.state);
      if (currentModel !== model) {
        setGridState((state) => ({
          ...state,
          groupingColumns: { ...state.groupingColumns, model },
        }));
        updateRowGrouping();
        forceUpdate();
      }
    },
    [apiRef, setGridState, forceUpdate, updateRowGrouping],
  );

  useGridApiMethod<GridGroupingColumnsApi>(
    apiRef,
    {
      setGroupingColumnsModel,
    },
    'GridGroupingColumnsApi',
  );

  /**
   * EVENTS
   */
  const handleCellKeyDown = React.useCallback<GridEventListener<GridEvents.cellKeyDown>>(
    (params, event) => {
      const cellParams = apiRef.current.getCellParams(params.id, params.field);
      if (
        cellParams.colDef.type === 'rowGroupByColumnsGroup' &&
        isSpaceKey(event.key) &&
        !event.shiftKey
      ) {
        event.stopPropagation();
        event.preventDefault();

        const filteredDescendantCount =
          gridFilteredDescendantCountLookupSelector(apiRef.current.state)[params.id] ?? 0;

        const isOnGroupingCell =
          props.groupingColumnMode === 'single' ||
          getGroupingColDefField(params.rowNode.groupingField) === params.field;
        if (!isOnGroupingCell || filteredDescendantCount === 0) {
          return;
        }

        apiRef.current.setRowChildrenExpansion(params.id, !params.rowNode.childrenExpanded);
      }
    },
    [apiRef, props.groupingColumnMode],
  );

  const handleColumnChange = React.useCallback<GridEventListener<GridEvents.columnsChange>>(() => {
    const groupingColumnsModel = gridGroupingRowsModelSelector(apiRef.current.state);
    const currentGroupingFields = sanitizedGroupingColumnsModelOnLastRowPreProcessing.current;

    if (!isDeepEqual(currentGroupingFields, groupingColumnsModel)) {
      updateRowGrouping();
    }
  }, [apiRef, updateRowGrouping]);

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
  useGridApiEventHandler(apiRef, GridEvents.columnsChange, handleColumnChange);

  /**
   * UPDATES
   */
  React.useEffect(() => {
    if (props.groupingColumnsModel !== undefined) {
      apiRef.current.setGroupingColumnsModel(props.groupingColumnsModel);
    }
  }, [apiRef, props.groupingColumnsModel]);
};
