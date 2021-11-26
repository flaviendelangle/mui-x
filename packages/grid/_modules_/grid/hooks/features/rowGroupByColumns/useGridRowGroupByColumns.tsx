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
import { gridRowGroupingColumnLookupSelector } from './rowGroupByColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import {
  orderGroupedByFields,
  getRowGroupingColumnLookup,
  createGroupingColDefMonoCriteria,
  createGroupingColDefSeveralCriteria,
} from './rowGroupByColumnsUtils';
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

const GROUP_ROWS_BY_COLUMN_NAME = 'group-rows-by-columns';

/**
 * Only available in DataGridPro
 * TODO: Add requirements
 */
export const useGridRowGroupByColumns = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    | 'defaultGroupingExpansionDepth'
    | 'groupingColDef'
    | 'groupingColumnMode'
    | 'disableChildrenFiltering'
    | 'disableChildrenSorting'
  >,
) => {
  /**
   * ROW GROUPING
   */
  const groupingFieldsOnLastRowPreProcessing = React.useRef<string[]>([]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumns = gridRowGroupingColumnLookupSelector(apiRef.current.state);
      const groupedByFields = orderGroupedByFields(groupingColumns);
      groupingFieldsOnLastRowPreProcessing.current = groupedByFields;

      if (groupedByFields.length === 0) {
        return null;
      }

      const distinctValues: { [field: string]: { map: { [val: string]: boolean }; list: any[] } } =
        Object.fromEntries(
          groupedByFields.map((groupingField) => [groupingField, { map: {}, list: [] }]),
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

        groupedByFields.forEach((groupedByField) => {
          const { key } = getCellGroupingCriteria({
            row,
            id: rowId,
            colDef: groupingColumns[groupedByField],
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
        const parentPath = groupedByFields
          .map((groupingField) =>
            getCellGroupingCriteria({
              row,
              id: rowId,
              colDef: groupingColumns[groupingField],
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
      const groupedByColDefs = getRowGroupingColumnLookup(columnsState.lookup);
      const orderedGroupedByFields = orderGroupedByFields(groupedByColDefs);

      if (orderedGroupedByFields.length === 0) {
        return [];
      }

      switch (props.groupingColumnMode) {
        case 'single': {
          const colDefOverride = isFunction(propGroupingColDef)
            ? propGroupingColDef({
                sources: Object.values(groupedByColDefs),
              })
            : propGroupingColDef ?? {};

          return [
            createGroupingColDefSeveralCriteria({
              apiRef,
              orderedGroupedByFields,
              colDefOverride,
              columnsLookup: columnsState.lookup,
            }),
          ];
        }

        case 'multiple': {
          return orderedGroupedByFields.map((groupedByField) => {
            const groupedByColDef = groupedByColDefs[groupedByField];

            const colDefOverride = isFunction(propGroupingColDef)
              ? propGroupingColDef({
                  sources: [groupedByColDef],
                })
              : propGroupingColDef ?? {};

            return createGroupingColDefMonoCriteria({
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

        const node = apiRef.current.getRowNode(params.id);
        const filteredDescendantCount =
          gridFilteredDescendantCountLookupSelector(apiRef.current.state)[params.id] ?? 0;

        if (!node || filteredDescendantCount === 0) {
          return;
        }

        apiRef.current.setRowChildrenExpansion(params.id, !node.childrenExpanded);
      }
    },
    [apiRef],
  );

  const handleColumnChange = React.useCallback<GridEventListener<GridEvents.columnsChange>>(() => {
    const groupingColumns = gridRowGroupingColumnLookupSelector(apiRef.current.state);
    const newGroupingFields = orderGroupedByFields(groupingColumns);
    const currentGroupingFields = groupingFieldsOnLastRowPreProcessing.current;

    if (!isDeepEqual(currentGroupingFields, newGroupingFields)) {
      updateRowGrouping();
    }
  }, [apiRef, updateRowGrouping]);

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
  useGridApiEventHandler(apiRef, GridEvents.columnsChange, handleColumnChange);
};
