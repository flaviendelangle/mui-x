import * as React from 'react';
import {
  GridHydrateRowsValue,
  GridPipeProcessor,
  useGridRegisterPipeProcessor,
} from '@mui/x-data-grid/internals';
import {
  GRID_ROOT_GROUP_ID,
  GridGroupNode,
  GridPinnedRowNode,
  GridRowEntry,
  GridRowId,
  GridRowModel,
} from '@mui/x-data-grid';
import { GridApiPro } from '../../../models/gridApiPro';
import { GridPinnedRowsProp } from './gridRowPinningInterface';
import { insertNodeInTree } from '../../../utils/tree/utils';

type GridPinnedRowPosition = keyof GridPinnedRowsProp;

export function addPinnedRow({
  groupingParams,
  rowModel,
  rowId,
  position,
  apiRef,
  isAutoGenerated,
}: {
  groupingParams: GridHydrateRowsValue;
  rowModel: GridRowModel | undefined;
  rowId: GridRowId;
  position: GridPinnedRowPosition;
  apiRef: React.MutableRefObject<GridApiPro>;
  isAutoGenerated: boolean;
}) {
  const dataRowIdToModelLookup = { ...groupingParams.dataRowIdToModelLookup };
  const dataRowIdToIdLookup = { ...groupingParams.dataRowIdToIdLookup };
  const tree = { ...groupingParams.tree };
  const treeDepths = { ...groupingParams.treeDepths };

  // TODO: warn if id is already present in `props.rows`

  const node: GridPinnedRowNode = {
    type: 'pinnedRow',
    id: rowId,
    depth: 0,
    parent: GRID_ROOT_GROUP_ID,
    isAutoGenerated,
  };

  insertNodeInTree({ node, tree, treeDepths });

  if (!isAutoGenerated) {
    dataRowIdToModelLookup[rowId] = rowModel;
    dataRowIdToIdLookup[rowId] = rowId;
  }
  // Do not push it to ids list so that pagination is not affected by pinned rows

  apiRef.current.unstable_caches.rows.dataRowIdToModelLookup[rowId] = { ...rowModel };
  apiRef.current.unstable_caches.rows.dataRowIdToIdLookup[rowId] = rowId;

  const previousPinnedRows = groupingParams.additionalRowGroups?.pinnedRows || {};

  const newPinnedRow: GridRowEntry = { id: rowId, model: rowModel };

  if (groupingParams.additionalRowGroups?.pinnedRows?.[position]?.includes(newPinnedRow)) {
    return {
      ...groupingParams,
      dataRowIdToModelLookup,
      dataRowIdToIdLookup,
      tree,
      treeDepths,
    };
  }

  return {
    ...groupingParams,
    dataRowIdToModelLookup,
    dataRowIdToIdLookup,
    tree,
    treeDepths,
    additionalRowGroups: {
      ...groupingParams.additionalRowGroups,
      pinnedRows: {
        ...previousPinnedRows,
        [position]: [...(previousPinnedRows[position] || []), newPinnedRow],
      },
    },
  };
}

export const useGridRowPinningPreProcessors = (apiRef: React.MutableRefObject<GridApiPro>) => {
  const addPinnedRows = React.useCallback<GridPipeProcessor<'hydrateRows'>>(
    (groupingParams) => {
      const pinnedRowsCache = apiRef.current.unstable_caches.pinnedRows || {};

      let newGroupingParams: GridHydrateRowsValue = {
        ...groupingParams,
        additionalRowGroups: {
          ...groupingParams.additionalRowGroups,
          // reset pinned rows state
          pinnedRows: {},
        },
      };

      pinnedRowsCache.topIds?.forEach((rowId) => {
        newGroupingParams = addPinnedRow({
          groupingParams: newGroupingParams,
          rowModel: pinnedRowsCache.idLookup[rowId],
          rowId,
          position: 'top',
          apiRef,
          isAutoGenerated: false,
        });
      });
      pinnedRowsCache.bottomIds?.forEach((rowId) => {
        newGroupingParams = addPinnedRow({
          groupingParams: newGroupingParams,
          rowModel: pinnedRowsCache.idLookup[rowId],
          rowId,
          position: 'bottom',
          apiRef,
          isAutoGenerated: false,
        });
      });

      // If row with the same `id` is present both in `rows` and `pinnedRows` - remove it from the root group children
      if (pinnedRowsCache.bottomIds?.length || pinnedRowsCache.topIds?.length) {
        const shouldKeepRow = (rowId: GridRowId) => {
          if (newGroupingParams.tree[rowId] && newGroupingParams.tree[rowId].type === 'pinnedRow') {
            return false;
          }
          return true;
        };

        const rootGroupNode = newGroupingParams.tree[GRID_ROOT_GROUP_ID] as GridGroupNode;
        newGroupingParams.tree[GRID_ROOT_GROUP_ID] = {
          ...rootGroupNode,
          children: rootGroupNode.children.filter(shouldKeepRow),
        };

        newGroupingParams.dataRowIds = newGroupingParams.dataRowIds.filter(shouldKeepRow);
      }

      return newGroupingParams;
    },
    [apiRef],
  );

  useGridRegisterPipeProcessor(apiRef, 'hydrateRows', addPinnedRows);
};
