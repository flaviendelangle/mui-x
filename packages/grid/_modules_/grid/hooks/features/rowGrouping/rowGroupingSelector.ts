import { createSelector } from 'reselect';
import { gridColumnLookupSelector } from '../columns';
import type { GridColumnLookup } from '../../../models';

export const gridRowGroupingColumnSelector = createSelector(gridColumnLookupSelector, (lookup) => {
  const groupingColumns: GridColumnLookup = {};
  Object.keys(lookup).forEach((key) => {
    if (lookup[key].groupRows) {
      groupingColumns[key] = lookup[key];
    }
  });

  return groupingColumns;
});
