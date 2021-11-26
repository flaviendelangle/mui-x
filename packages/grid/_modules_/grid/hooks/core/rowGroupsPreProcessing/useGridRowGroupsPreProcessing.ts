import * as React from 'react';
import { GridPrivateApiRef } from '../../../models/api/gridApiRef';
import { GridRowTreeConfig } from '../../../models/gridRows';
import {
  GridRowGroupsPreProcessingPrivateApi,
  GridRowGroupingPreProcessing,
  GridRowGroupingResult,
} from './gridRowGroupsPreProcessingApi';
import { GridEvents } from '../../../constants/eventsConstants';

const getFlatRowTree: GridRowGroupingPreProcessing = ({ ids, idRowsLookup }) => {
  const tree: GridRowTreeConfig = {};
  for (let i = 0; i < ids.length; i += 1) {
    const rowId = ids[i];
    tree[rowId] = { id: rowId, depth: 0, parent: null, groupingValue: '' };
  }

  return {
    tree,
    treeDepth: 1,
    idRowsLookup,
    ids,
  };
};

export const useGridRowGroupsPreProcessing = (apiRef: GridPrivateApiRef) => {
  const rowGroupsPreProcessingRef = React.useRef(
    new Map<string, GridRowGroupingPreProcessing | null>(),
  );

  const registerRowGroupsBuilder = React.useCallback<
    GridRowGroupsPreProcessingPrivateApi['registerRowGroupsBuilder']
  >(
    (processingName, rowGroupingPreProcessing) => {
      const rowGroupingPreProcessingBefore =
        rowGroupsPreProcessingRef.current.get(processingName) ?? null;

      if (rowGroupingPreProcessingBefore !== rowGroupingPreProcessing) {
        rowGroupsPreProcessingRef.current.set(processingName, rowGroupingPreProcessing);
        apiRef.current.publishEvent(GridEvents.rowGroupsPreProcessingChange);
      }
    },
    [apiRef],
  );

  const groupRows = React.useCallback<GridRowGroupsPreProcessingPrivateApi['groupRows']>(
    (...params) => {
      let response: GridRowGroupingResult | null = null;
      const preProcessingList = Array.from(rowGroupsPreProcessingRef.current.values());

      while (!response && preProcessingList.length) {
        const preProcessing = preProcessingList.shift();

        if (preProcessing) {
          response = preProcessing(...params);
        }
      }

      if (!response) {
        return getFlatRowTree(...params)!;
      }

      return response;
    },
    [],
  );

  const rowGroupsPreProcessingApi: GridRowGroupsPreProcessingPrivateApi = {
    registerRowGroupsBuilder,
    groupRows,
  };

  apiRef.current.register('private', rowGroupsPreProcessingApi);
};
