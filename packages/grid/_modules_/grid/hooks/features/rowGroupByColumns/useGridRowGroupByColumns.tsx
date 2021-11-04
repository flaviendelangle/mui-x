import * as React from 'react';
import type {
  GridApiRef,
  GridCellParams,
  GridRowModel,
  MuiEvent,
  GridColDefOverrideParams,
  GridRowId,
  GridColDef,
  GridRawColumnLookup,
} from '../../../models';
import { GridColumnsPreProcessing } from '../../core/columnsPreProcessing';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { buildRowTree } from '../../../utils/rowTreeUtils';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../constants/eventsConstants';
import { gridRowGroupingColumnLookupSelector } from './rowGroupByColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { orderGroupedByFields, getRowGroupingColumnLookup } from './rowGroupByColumnsUtils';
import { isDeepEqual, isFunction } from '../../../utils/utils';
import { GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF } from './gridRowGroupByColumnsGroupColDef';
import { GridRowGroupByColumnsGroupingCell } from '../../../components/cell/GridRowGroupByColumnsGroupingCell';

/**
 * Only available in DataGridPro
 * TODO: Add requirements
 */
export const useGridRowGroupByColumns = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    'defaultGroupingExpansionDepth' | 'groupingColDef' | 'groupingColumnMode'
  >,
) => {
  const getGroupingColDefs = React.useCallback(
    (groupedByColDefs: GridRawColumnLookup, orderedGroupedByFields: string[]) => {
      const propGroupingColDef = props.groupingColDef;
      if (orderedGroupedByFields.length === 0) {
        return [];
      }

      const lookup: GridColDef[] = [];
      if (props.groupingColumnMode === 'single') {
        const fullBaseColDef: GridColDef = {
          ...GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF,
          headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
          renderCell: (params) => <GridRowGroupByColumnsGroupingCell {...params} />,
          field: '__row_group_by_columns_group__',
        };

        let colDefOverride: Partial<GridColDef>;

        if (isFunction(propGroupingColDef)) {
          const params: GridColDefOverrideParams = {
            colDef: fullBaseColDef,
            sources: Object.values(groupedByColDefs),
          };

          colDefOverride = propGroupingColDef(params);
        } else {
          colDefOverride = propGroupingColDef ?? {};
        }

        lookup.push({ ...fullBaseColDef, ...colDefOverride });
      } else {
        orderedGroupedByFields.forEach((groupedByField, depth) => {
          const groupedByColDef = groupedByColDefs[groupedByField];

          // TODO: Handle valueFormatter
          const fullBaseColDef: GridColDef = {
            ...GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF,
            headerName: groupedByColDef.headerName ?? groupedByColDef.field,
            renderCell: (params) => {
              if (params.rowNode.depth !== depth) {
                return '';
              }

              return <GridRowGroupByColumnsGroupingCell {...params} />;
            },
            field: `__row_group_by_columns_group_${groupedByField}__`,
          };

          let colDefOverride: Partial<GridColDef>;

          if (isFunction(propGroupingColDef)) {
            const params: GridColDefOverrideParams = {
              colDef: fullBaseColDef,
              sources: [groupedByColDef],
            };

            colDefOverride = propGroupingColDef(params);
          } else {
            colDefOverride = propGroupingColDef ?? {};
          }

          lookup.push({ ...fullBaseColDef, ...colDefOverride });
        });
      }

      return lookup;
    },
    [apiRef, props.groupingColDef, props.groupingColumnMode],
  );

  const groupingFieldsOnLastRowPreProcessing = React.useRef<string[]>([]);

  const updateColumnsPreProcessing = React.useCallback(() => {
    const addGroupingColumn: GridColumnsPreProcessing = (columnsState) => {
      const groupedByColDefs = getRowGroupingColumnLookup(columnsState.lookup);
      const orderedGroupedByFields = orderGroupedByFields(groupedByColDefs);
      const groupingColDefs = getGroupingColDefs(groupedByColDefs, orderedGroupedByFields);

      if (columnsState.all.length === 0) {
        return columnsState;
      }

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
      const startIndex =
        columnsState.lookup[columnsState.all[0]].type === 'checkboxSelection' ? 1 : 0;
      columnsState.all = [
        ...columnsState.all.slice(0, startIndex),
        ...groupingColDefs.map((colDef) => colDef.field),
        ...columnsState.all.slice(startIndex),
      ];

      return columnsState;
    };

    apiRef.current.unstable_registerColumnPreProcessing('rowGrouping', addGroupingColumn);
  }, [apiRef, getGroupingColDefs]);

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

      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];

        groupedByFields.forEach((groupedByField) => {
          const cellKey = getCellKey({
            row,
            id: rowId,
            colDef: groupingColumns[groupedByField],
            field: groupedByField,
          });
          const groupingFieldsDistinctKeys = distinctValues[groupedByField];

          if (!groupingFieldsDistinctKeys.map[cellKey]) {
            groupingFieldsDistinctKeys.map[cellKey] = true;
            groupingFieldsDistinctKeys.list.push(cellKey);
          }
        });
      });

      const rows = params.ids.map((rowId) => {
        const row = params.idRowsLookup[rowId];
        const parentPath = groupedByFields.map((groupingField) =>
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

    return apiRef.current.unstable_registerRowGroupsBuilder('rowGrouping', groupRows);
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
      if (cellParams.colDef.type === 'rowGroupByColumnsGroup' && isSpaceKey(event.key)) {
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
    const groupingColumns = gridRowGroupingColumnLookupSelector(apiRef.current.state);
    const newGroupingFields = orderGroupedByFields(groupingColumns);
    const currentGroupingFields = groupingFieldsOnLastRowPreProcessing.current;

    if (!isDeepEqual(currentGroupingFields, newGroupingFields)) {
      updateRowGrouping();
    }
  };

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
  useGridApiEventHandler(apiRef, GridEvents.columnsChange, handleColumnChange);
};
