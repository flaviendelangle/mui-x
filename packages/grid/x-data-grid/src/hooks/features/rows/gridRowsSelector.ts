import { createSelector } from '../../../utils/createSelector';
import { GridStateCommunity } from '../../../models/gridStateCommunity';

export const gridRowsStateSelector = (state: GridStateCommunity) => state.rows;

export const gridRowCountSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.totalRowCount,
);

export const gridRowsLoadingSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.loading,
);

export const gridTopLevelRowCountSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.totalTopLevelRowCount,
);

// TODO rows v6: Rename
export const gridRowsLookupSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.dataRowIdToModelLookup,
);

export const gridRowsDataRowIdToIdLookupSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.dataRowIdToIdLookup,
);

export const gridRowTreeSelector = createSelector(gridRowsStateSelector, (rows) => rows.tree);

export const gridRowGroupingNameSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.groupingName,
);

export const gridRowTreeDepthSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.treeDepth,
);

export const gridDataRowIdsSelector = createSelector(
  gridRowsStateSelector,
  (rows) => rows.dataRowIds,
);
