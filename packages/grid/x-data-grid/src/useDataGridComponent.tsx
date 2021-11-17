import type { GridComponentProps, GridApiRef } from '../../_modules_';

import { useGridInitialization } from '../../_modules_/grid/hooks/core';

import { useGridClipboard } from '../../_modules_/grid/hooks/features/clipboard/useGridClipboard';
import { useGridColumnMenu } from '../../_modules_/grid/hooks/features/columnMenu/useGridColumnMenu';
import { useGridColumns } from '../../_modules_/grid/hooks/features/columns/useGridColumns';
import { useGridDensity } from '../../_modules_/grid/hooks/features/density/useGridDensity';
import { useGridCsvExport } from '../../_modules_/grid/hooks/features/export/useGridCsvExport';
import { useGridPrintExport } from '../../_modules_/grid/hooks/features/export/useGridPrintExport';
import { useGridFilter } from '../../_modules_/grid/hooks/features/filter/useGridFilter';
import { useGridFocus } from '../../_modules_/grid/hooks/features/focus/useGridFocus';
import { useGridKeyboard } from '../../_modules_/grid/hooks/features/keyboard/useGridKeyboard';
import { useGridKeyboardNavigation } from '../../_modules_/grid/hooks/features/keyboard/useGridKeyboardNavigation';
import { useGridPageSize } from '../../_modules_/grid/hooks/features/pagination/useGridPageSize';
import { useGridPage } from '../../_modules_/grid/hooks/features/pagination/useGridPage';
import { useGridPreferencesPanel } from '../../_modules_/grid/hooks/features/preferencesPanel/useGridPreferencesPanel';
import { useGridEditRows } from '../../_modules_/grid/hooks/features/editRows/useGridEditRows';
import { useGridRows } from '../../_modules_/grid/hooks/features/rows/useGridRows';
import { useGridParamsApi } from '../../_modules_/grid/hooks/features/rows/useGridParamsApi';
import { useGridSelection } from '../../_modules_/grid/hooks/features/selection/useGridSelection';
import { useGridSorting } from '../../_modules_/grid/hooks/features/sorting/useGridSorting';
import { useGridScroll } from '../../_modules_/grid/hooks/features/scroll/useGridScroll';
import { useGridEvents } from '../../_modules_/grid/hooks/features/events/useGridEvents';
import { useGridDimensions } from '../../_modules_/grid/hooks/features/dimensions/useGridDimensions';

export const useDataGridComponent = (apiRef: GridApiRef, props: GridComponentProps) => {
  const privateApiRef = useGridInitialization(apiRef, props);
  useGridSelection(privateApiRef, props);
  useGridColumns(privateApiRef, props);
  useGridRows(privateApiRef, props);
  useGridParamsApi(privateApiRef);
  useGridEditRows(privateApiRef, props);
  useGridFocus(privateApiRef, props);
  useGridSorting(privateApiRef, props);
  useGridPreferencesPanel(privateApiRef, props);
  useGridFilter(privateApiRef, props);
  useGridDensity(privateApiRef, props);
  useGridPageSize(privateApiRef, props);
  useGridPage(privateApiRef, props);
  useGridScroll(privateApiRef, props);
  useGridColumnMenu(privateApiRef);
  useGridKeyboard(privateApiRef);
  useGridKeyboardNavigation(privateApiRef, props);
  useGridCsvExport(privateApiRef);
  useGridPrintExport(privateApiRef, props);
  useGridClipboard(privateApiRef);
  useGridDimensions(privateApiRef, props);
  useGridEvents(privateApiRef, props);
};
