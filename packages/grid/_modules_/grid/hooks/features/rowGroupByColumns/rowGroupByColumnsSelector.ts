import { createSelector } from 'reselect';
import { gridColumnLookupSelector } from '../columns';
import { getRowGroupingColumnLookup } from './rowGroupByColumnsUtils';

export const gridRowGroupingColumnLookupSelector = createSelector(
  gridColumnLookupSelector,
  getRowGroupingColumnLookup,
);
