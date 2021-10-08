import * as React from 'react';
import { GridColumnsPreProcessing } from '../../root/columnsPreProcessing';
import type { GridApiRef, GridCellParams, GridRowConfigTree, MuiEvent } from '../../../models';
import { GridRowGroupingPreProcessing } from '../../root/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { useGridApiEventHandler } from '../../root/useGridApiEventHandler';
import { GridEvents } from '../../../constants/eventsConstants';
import { gridRowGroupingColumnSelector } from './rowGroupingSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridRowId, GridRowsLookup } from '../../../models';

export const useGridRowGrouping = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'defaultGroupingExpansionDepth'>,
) => {
  const updateColumnsPreProcessing = React.useCallback(() => {
    const addGroupingColumn: GridColumnsPreProcessing = (columns) => columns;

    apiRef.current.registerColumnPreProcessing('rowGrouping', addGroupingColumn);
  }, [apiRef]);

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

      const fullTree: GridRowConfigTree = new Map();
      const fillerPaths: Record<GridRowId, string[]> = {};
      const idRowsLookupFiller: GridRowsLookup = {};

      const buildGroupingFieldTree = ({
        tree,
        parentPath,
      }: {
        tree: GridRowConfigTree;
        parentPath: string[];
      }) => {
        const depth = parentPath.length;
        const groupingField = groupingFields[depth];

        distinctValues[groupingField].list.forEach((groupingValue) => {
          const fillerId = `filler-row-${groupingField}-${groupingValue}`;
          const path = [...parentPath, groupingValue];
          const childrenTree = new Map();

          tree.set(groupingValue, {
            id: fillerId,
            fillerNode: true,
            depth: 0,
            expanded: props.defaultGroupingExpansionDepth > depth,
            children: childrenTree,
          });
          idRowsLookupFiller[fillerId] = {};
          fillerPaths[fillerId] = path;

          if (depth < groupingFields.length - 1) {
            buildGroupingFieldTree({ tree: childrenTree, parentPath: path });
          }
        });
      };

      buildGroupingFieldTree({ tree: fullTree, parentPath: [] });

      const leafDepth = groupingFields.length;
      const leafPaths: Record<GridRowId, string[]> = {};

      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];
        // TODO: Handle valueGetter
        const path = groupingFields.map((groupingField) => row[groupingField]);
        leafPaths[rowId] = path;
        let tree = fullTree;
        path.forEach((nodeName) => {
          tree = tree.get(nodeName)!.children!;
        });

        tree.set(rowId.toString(), {
          id: rowId,
          depth: leafDepth,
        });
      });

      return {
        tree: fullTree,
        paths: { ...leafPaths, ...fillerPaths },
        idRowsLookup: { ...params.idRowsLookup, ...idRowsLookupFiller },
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
      if (cellParams.field === '__tree_data_group__' && isSpaceKey(event.key)) {
        event.stopPropagation();
        apiRef.current.setRowExpansion(params.id, !apiRef.current.getRowNode(params.id)?.expanded);
      }
    },
    [apiRef],
  );

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
};
