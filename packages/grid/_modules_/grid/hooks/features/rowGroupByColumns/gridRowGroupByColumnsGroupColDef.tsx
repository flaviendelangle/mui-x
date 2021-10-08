import * as React from 'react';
import { GridRowGroupByColumnsGroupingCell } from '../../../components/cell/GridRowGroupByColumnsGroupingCell';
import { GridColDef } from '../../../models/colDef/gridColDef';
import { GRID_STRING_COL_DEF } from '../../../models/colDef/gridStringColDef';

export const GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF: GridColDef = {
  ...GRID_STRING_COL_DEF,
  field: '__row_group_by_columns_group',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableReorder: true,
  shouldRenderFillerRows: true,
  align: 'left',
  width: 200,
  renderCell: (params) => <GridRowGroupByColumnsGroupingCell {...params} />,
};
