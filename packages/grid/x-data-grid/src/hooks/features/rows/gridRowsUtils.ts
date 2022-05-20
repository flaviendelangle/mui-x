import * as React from 'react';
import { GridRowId, GridRowIdGetter, GridRowModel, GridRowTreeConfig } from '../../../models';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';
import { GridRowsInternalCache, GridRowsState } from './gridRowsInterfaces';

export const GRID_ROOT_GROUP_ID = `auto-generated-group-node-root`;

/**
 * A helper function to check if the id provided is valid.
 * @param {GridRowId} id Id as [[GridRowId]].
 * @param {GridRowModel | Partial<GridRowModel>} row Row as [[GridRowModel]].
 * @param {string} detailErrorMessage A custom error message to display for invalid IDs
 */
export function checkGridRowIdIsValid(
  id: GridRowId,
  row: GridRowModel | Partial<GridRowModel>,
  detailErrorMessage: string = 'A row was provided without id in the rows prop:',
) {
  if (id == null) {
    throw new Error(
      [
        'MUI: The data grid component requires all rows to have a unique `id` property.',
        'Alternatively, you can use the `getRowId` prop to specify a custom id for each row.',
        detailErrorMessage,
        JSON.stringify(row),
      ].join('\n'),
    );
  }
}

export const getRowIdFromRowModel = (
  rowModel: GridRowModel,
  getRowId?: GridRowIdGetter,
  detailErrorMessage?: string,
): GridRowId => {
  const id = getRowId ? getRowId(rowModel) : rowModel.id;
  checkGridRowIdIsValid(id, rowModel, detailErrorMessage);
  return id;
};

export const createRowsInternalCache = ({
  rows,
  getRowId,
  loading,
}: Pick<DataGridProcessedProps, 'rows' | 'getRowId' | 'loading'>): GridRowsInternalCache => {
  const cache: GridRowsInternalCache = {
    rowsBeforePartialUpdates: rows,
    loadingPropBeforePartialUpdates: loading,
    idRowsLookup: {},
    idToIdLookup: {},
    ids: [],
    partialUpdates: null,
  };

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const id = getRowIdFromRowModel(row, getRowId);
    cache.idRowsLookup[id] = row;
    cache.idToIdLookup[id] = id;
    cache.ids.push(id);
  }

  return cache;
};

export const getRowsStateFromCache = ({
  apiRef,
  previousTree,
  rowCountProp,
  loadingProp,
}: {
  apiRef: React.MutableRefObject<GridApiCommunity>;
  previousTree: GridRowTreeConfig | null;
  rowCountProp: number | undefined;
  loadingProp: boolean | undefined;
}): GridRowsState => {
  const { rowsBeforePartialUpdates, ...cacheForGrouping } = apiRef.current.unstable_caches.rows;
  const rowCount = rowCountProp ?? 0;

  const groupingResponse = apiRef.current.unstable_applyStrategyProcessor('rowTreeCreation', {
    ...cacheForGrouping,
    previousTree,
  });

  const processedGroupingResponse = apiRef.current.unstable_applyPipeProcessors(
    'hydrateRows',
    groupingResponse,
  );

  const dataTopLevelRowCount =
    processedGroupingResponse.treeDepth === 1
      ? processedGroupingResponse.ids.length
      : Object.values(processedGroupingResponse.tree).filter((node) => node.parent == null).length;

  return {
    ...processedGroupingResponse,
    groupingResponseBeforeRowHydration: groupingResponse,
    loading: loadingProp,
    totalRowCount: Math.max(rowCount, processedGroupingResponse.ids.length),
    totalTopLevelRowCount: Math.max(rowCount, dataTopLevelRowCount),
  };
};

export const getTreeNodeDescendants = (
  tree: GridRowTreeConfig,
  parentId: GridRowId,
  skipAutoGeneratedRows: boolean,
) => {
  const node = tree[parentId];
  if (node.type !== 'group') {
    return [];
  }

  const validDescendants: GridRowId[] = [];
  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];
    const childNode = tree[child];
    if (
      !skipAutoGeneratedRows ||
      childNode.type === 'leaf' ||
      (childNode.type === 'group' && !childNode.isAutoGenerated)
    ) {
      validDescendants.push(child);
    }
    validDescendants.push(...getTreeNodeDescendants(tree, childNode.id, skipAutoGeneratedRows));
  }

  return validDescendants;
};
