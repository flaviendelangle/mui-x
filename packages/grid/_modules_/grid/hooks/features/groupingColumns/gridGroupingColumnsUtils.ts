export const getGroupingColDefField = (groupedByField: string | null) => {
  if (groupedByField === null) {
    return '__row_group_by_columns_group__';
  }

  return `__row_group_by_columns_group_${groupedByField}__`;
};
