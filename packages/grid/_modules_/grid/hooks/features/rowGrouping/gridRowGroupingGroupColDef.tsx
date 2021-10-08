import * as React from 'react';
import { GridRowGroupingGroupingCell } from '../../../components/cell/GridRowGroupingGroupingCell';
import { GridColDef } from '../../../models/colDef/gridColDef';
import { GRID_STRING_COL_DEF } from '../../../models/colDef/gridStringColDef';

export const GridRowGroupingGroupColDef: GridColDef = {
  ...GRID_STRING_COL_DEF,
  field: '__row_grouping_data_group__',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableReorder: true,
  shouldRenderFillerRows: true,
  align: 'left',
  width: 200,
  renderCell: (params) => <GridRowGroupingGroupingCell {...params} />,
};
