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
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../constants/eventsConstants';
import { gridRowGroupingColumnSelector } from './rowGroupByColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridColDef, GridRowId } from '../../../models';
import { GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF } from './gridRowGroupByColumnsGroupColDef';
import { generateRowTree } from '../rows/gridRowsUtils';

const orderGroupingFields = (groupingColumns: GridColumnLookup) => {
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

export const useGridRowGroupByColumns = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'defaultGroupingExpansionDepth' | 'groupingColDef'>,
) => {
  const updateColumnsPreProcessing = React.useCallback(() => {
    const addGroupingColumn: GridColumnsPreProcessing = (columns) => {
      const hasGroupingColumns = columns.some((col) => col.groupRows);
      if (!hasGroupingColumns) {
        return columns;
      }

      const index = columns[0].type === 'checkboxSelection' ? 1 : 0;
      const groupingColumn: GridColDef = {
        ...GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF,
        headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
        ...props.groupingColDef,
      };

      return [...columns.slice(0, index), groupingColumn, ...columns.slice(index)];
    };

    apiRef.current.UNSTABLE_registerColumnPreProcessing('rowGrouping', addGroupingColumn);
  }, [apiRef, props.groupingColDef]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumns = gridRowGroupingColumnSelector(apiRef.current.state);
      const groupingFields = orderGroupingFields(groupingColumns);

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

      return generateRowTree({
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
        apiRef.current.UNSTABLE_setRowExpansion(
          params.id,
          !apiRef.current.UNSTABLE_getRowNode(params.id)?.expanded,
        );
      }
    },
    [apiRef],
  );

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
};
