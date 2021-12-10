import type { GridApiRef } from '../../models/api/gridApiRef';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

import { useGridLoggerFactory } from './useGridLoggerFactory';
import { useGridApiInitialization } from './useGridApiInitialization';
import { useGridErrorHandler } from './useGridErrorHandler';
import { useGridControlState } from './useGridControlState';
import { useGridLocaleText } from './useGridLocaleText';
import { useGridPreProcessing } from './preProcessing';
import { useGridRowGroupsPreProcessing } from './rowGroupsPerProcessing';

/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
export const useGridInitialization = (apiRef: GridApiRef, props: DataGridProcessedProps) => {
  useGridLoggerFactory(apiRef, props);
  useGridApiInitialization(apiRef, props);
  useGridErrorHandler(apiRef, props);
  useGridControlState(apiRef, props);
  useGridPreProcessing(apiRef);
  useGridRowGroupsPreProcessing(apiRef);
  useGridLocaleText(apiRef, props);
};
