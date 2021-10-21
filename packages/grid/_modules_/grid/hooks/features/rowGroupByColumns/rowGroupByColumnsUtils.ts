import type { GridColumnLookup, GridRawColumnLookup } from '../../../models';

export const getRowGroupingColumnLookup = <V extends GridColumnLookup | GridRawColumnLookup>(
  lookup: V,
) => {
  const groupingColumns = {} as V;
  Object.keys(lookup).forEach((key) => {
    if (lookup[key].groupRows) {
      groupingColumns[key] = lookup[key];
    }
  });

  return groupingColumns;
};

export const orderGroupedByFields = (groupingColumns: GridRawColumnLookup) => {
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
