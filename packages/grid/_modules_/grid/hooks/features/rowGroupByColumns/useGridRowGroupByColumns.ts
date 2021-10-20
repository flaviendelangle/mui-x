import * as React from 'react';
import type {
  GridApiRef,
  GridCellParams,
  GridColumnLookup,
  GridRowModel,
  MuiEvent,
} from '../../../models';
import { GridColumnsPreProcessing } from '../../core/columnsPreProcessing';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { buildRowTree } from '../../../utils/rowTreeUtils';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../constants/eventsConstants';
import { gridRowGroupingColumnSelector } from './rowGroupByColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridColDef, GridRowId } from '../../../models';
import { GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF } from './gridRowGroupByColumnsGroupColDef';
import { orderGroupingFields } from './rowGroupByColumnsUtils';

/**
 * Only available in DataGridPro
 * TODO: Add requirements
 */
export const useGridRowGroupByColumns = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'defaultGroupingExpansionDepth' | 'groupingColDef'>,
) => {
  const groupingFieldsOnLastRowPreProcessing = React.useRef<string[]>([]);

  const updateColumnsPreProcessing = React.useCallback(() => {
    const addGroupingColumn: GridColumnsPreProcessing = (columnsState) => {
      const groupingColumn: GridColDef = {
        ...GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF,
        headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
        ...props.groupingColDef,
      };

      const shouldHaveGroupingColumn = columnsState.all.some(
        (col) => columnsState.lookup[col].groupRows,
      );
      const haveGroupingColumn = columnsState.lookup[groupingColumn.field] != null;

      if (shouldHaveGroupingColumn && !haveGroupingColumn) {
        columnsState.lookup[groupingColumn.field] = groupingColumn;
        const index = columnsState.lookup[columnsState.all[0]].type === 'checkboxSelection' ? 1 : 0;
        columnsState.all = [
          ...columnsState.all.slice(0, index),
          groupingColumn.field,
          ...columnsState.all.slice(index),
        ];
      } else if (!shouldHaveGroupingColumn && haveGroupingColumn) {
        delete columnsState.lookup[groupingColumn.field];
        columnsState.all = columnsState.all.filter((field) => field !== groupingColumn.field);
      }

      return columnsState;
    };

    apiRef.current.UNSTABLE_registerColumnPreProcessing('rowGrouping', addGroupingColumn);
  }, [apiRef, props.groupingColDef]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumns = gridRowGroupingColumnSelector(apiRef.current.state);
      const groupingFields = orderGroupingFields(groupingColumns);
      groupingFieldsOnLastRowPreProcessing.current = groupingFields;

      if (groupingFields.length === 0) {
        return null;
      }

      const distinctValues: { [field: string]: { map: { [val: string]: boolean }; list: any[] } } =
        Object.fromEntries(
          groupingFields.map((groupingField) => [groupingField, { map: {}, list: [] }]),
        );

      const getCellKey = ({
        row,
        id,
        colDef,
        field,
      }: {
        row: GridRowModel;
        id: GridRowId;
        colDef: GridColDef;
        field: string;
      }) => {
        // TODO: Handle valueGetter
        const value = row[field];

        if (colDef.keyGetter) {
          return colDef.keyGetter({
            value,
            id,
            field,
          });
        }

        return value;
      };

      params.rowIds.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];

        groupingFields.forEach((groupingField) => {
          const cellKey = getCellKey({
            row,
            id: rowId,
            colDef: groupingColumns[groupingField],
            field: groupingField,
          });
          const groupingFieldsDistinctKeys = distinctValues[groupingField];

          if (!groupingFieldsDistinctKeys.map[cellKey]) {
            groupingFieldsDistinctKeys.map[cellKey] = true;
            groupingFieldsDistinctKeys.list.push(cellKey);
          }
        });
      });

      const rows = params.rowIds.map((rowId) => {
        const row = params.idRowsLookup[rowId];
        const parentPath = groupingFields.map((groupingField) =>
          getCellKey({
            row,
            id: rowId,
            colDef: groupingColumns[groupingField],
            field: groupingField,
          }),
        );

        return {
          path: [...parentPath, rowId.toString()],
          id: rowId,
        };
      });

      return buildRowTree({
        ...params,
        rows,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
      });
    };

    return apiRef.current.UNSTABLE_registerRowGroupsBuilder('rowGrouping', groupRows);
  }, [apiRef, props.defaultGroupingExpansionDepth]);

  useFirstRender(() => {
    updateColumnsPreProcessing();
    updateRowGrouping();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      return;
    }

    updateColumnsPreProcessing();
  }, [updateColumnsPreProcessing]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateRowGrouping();
  }, [updateRowGrouping]);

  const handleCellKeyDown = React.useCallback(
    (params: GridCellParams, event: MuiEvent<React.KeyboardEvent>) => {
      const cellParams = apiRef.current.getCellParams(params.id, params.field);
      if (cellParams.field === '__row_group_by_columns_group' && isSpaceKey(event.key)) {
        event.stopPropagation();
        apiRef.current.unstable_setRowExpansion(
          params.id,
          !apiRef.current.unstable_getRowNode(params.id)?.expanded,
        );
      }
    },
    [apiRef],
  );

  const handleColumnChange = () => {
    const groupingColumns = gridRowGroupingColumnSelector(apiRef.current.state);
    const newGroupingFields = orderGroupingFields(groupingColumns);
    const currentGroupingFields = groupingFieldsOnLastRowPreProcessing.current;
    const hasGroupingFieldChanged =
      newGroupingFields.length !== currentGroupingFields.length ||
      newGroupingFields.some((field, index) => field !== currentGroupingFields[index]);

    if (hasGroupingFieldChanged) {
      updateRowGrouping();
    }
  };

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
  useGridApiEventHandler(apiRef, GridEvents.columnsChange, handleColumnChange);
};
