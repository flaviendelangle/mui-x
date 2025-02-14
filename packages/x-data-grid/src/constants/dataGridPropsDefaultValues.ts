import { GridEditModes } from '../models/gridEditRowModel';
import type { DataGridPropsWithDefaultValues } from '../models/props/DataGridProps';

/**
 * The default values of `DataGridPropsWithDefaultValues` to inject in the props of DataGrid.
 */
export const DATA_GRID_PROPS_DEFAULT_VALUES: DataGridPropsWithDefaultValues = {
  autoHeight: false,
  autoPageSize: false,
  autosizeOnMount: false,
  checkboxSelection: false,
  checkboxSelectionVisibleOnly: false,
  clipboardCopyCellDelimiter: '\t',
  columnBufferPx: 150,
  columnHeaderHeight: 56,
  disableAutosize: false,
  disableColumnFilter: false,
  disableColumnMenu: false,
  disableColumnReorder: false,
  disableColumnResize: false,
  disableColumnSelector: false,
  disableColumnSorting: false,
  disableDensitySelector: false,
  disableEval: false,
  disableMultipleColumnsFiltering: false,
  disableMultipleColumnsSorting: false,
  disableMultipleRowSelection: false,
  disableRowSelectionOnClick: false,
  disableVirtualization: false,
  editMode: GridEditModes.Cell,
  filterDebounceMs: 150,
  filterMode: 'client',
  hideFooter: false,
  hideFooterPagination: false,
  hideFooterRowCount: false,
  hideFooterSelectedRowCount: false,
  ignoreDiacritics: false,
  ignoreValueFormatterDuringExport: false,
  keepColumnPositionIfDraggedOutside: false,
  keepNonExistentRowsSelected: false,
  loading: false,
  logger: console,
  logLevel: process.env.NODE_ENV === 'production' ? ('error' as const) : ('warn' as const),
  pageSizeOptions: [25, 50, 100],
  pagination: false,
  paginationMode: 'client',
  resetPageOnSortFilter: false,
  resizeThrottleMs: 60,
  rowBufferPx: 150,
  rowHeight: 52,
  rows: [],
  rowSelection: true,
  rowSpacingType: 'margin',
  rowSpanning: false,
  showCellVerticalBorder: false,
  showColumnVerticalBorder: false,
  sortingMode: 'client',
  sortingOrder: ['asc' as const, 'desc' as const, null],
  throttleRowsMs: 0,
  virtualizeColumnsWithAutoRowHeight: false,
};
