import * as React from 'react';
import { GridColumnsPreProcessing } from '../../root/columnsPreProcessing';
import type { GridApiRef, GridCellParams, GridRowConfigTree, MuiEvent } from '../../../models';
import { GridRowGroupingPreProcessing } from '../../root/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { useGridApiEventHandler } from '../../root/useGridApiEventHandler';
import { GridEvents } from '../../../constants/eventsConstants';
import { gridRowGroupingColumnSelector } from './rowGroupByColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridColDef, GridRowId, GridRowsLookup } from '../../../models';
import { GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF } from './gridRowGroupByColumnsGroupColDef';
import { insertLeafInTree } from '../rows/gridRowsUtils';

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

    apiRef.current.registerColumnPreProcessing('rowGrouping', addGroupingColumn);
  }, [apiRef, props.groupingColDef]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumns = gridRowGroupingColumnSelector(apiRef.current.state);
      const groupingFields = Object.keys(groupingColumns);

      if (groupingFields.length === 0) {
        return null;
      }

      const distinctValues: { [field: string]: { map: { [val: string]: boolean }; list: any[] } } =
        Object.fromEntries(
          groupingFields.map((groupingField) => [groupingField, { map: {}, list: [] }]),
        );

      // TODO: Handle valueGetter
      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];

        groupingFields.forEach((groupingField) => {
          const cellValue = row[groupingField];
          const groupingFieldDistinctValues = distinctValues[groupingField];

          if (!groupingFieldDistinctValues.map[cellValue]) {
            groupingFieldDistinctValues.map[cellValue] = true;
            groupingFieldDistinctValues.list.push(cellValue);
          }
        });
      });

      const tree: GridRowConfigTree = new Map();
      const idRowsLookup: GridRowsLookup = { ...params.idRowsLookup };
      const paths: Record<GridRowId, string[]> = {};

      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];
        // TODO: Handle valueGetter
        const parentPath = groupingFields.map((groupingField) => row[groupingField]);

        insertLeafInTree({
          tree,
          path: [...parentPath, rowId.toString()],
          id: rowId,
          defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
          paths,
          idRowsLookup,
        });
      });

      return {
        tree,
        paths,
        idRowsLookup,
      };
    };

    return apiRef.current.registerRowGroupsBuilder('rowGrouping', groupRows);
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
