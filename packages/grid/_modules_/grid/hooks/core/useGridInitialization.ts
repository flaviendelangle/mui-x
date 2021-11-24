import type { GridApiRef } from '../../models/api/gridApiRef';
import type { GridComponentProps } from '../../GridComponentProps';

import { useGridLoggerFactory } from './useGridLoggerFactory';
import { useGridApiInitialization } from './useGridApiInitialization';
import { useGridErrorHandler } from './useGridErrorHandler';
import { useGridStateInitialization } from './useGridStateInitialization';
import { useGridLocaleText } from './useGridLocaleText';
import { useGridPreProcessing } from './preProcessing';
import { useGridRowGroupsPreProcessing } from './rowGroupsPerProcessing';

/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
export const useGridInitialization = (apiRef: GridApiRef, props: GridComponentProps) => {
  useGridLoggerFactory(apiRef, props);
  const privateApiRef = useGridApiInitialization(apiRef, props);
  useGridErrorHandler(privateApiRef, props);
  useGridStateInitialization(privateApiRef, props);
  useGridPreProcessing(privateApiRef);
  useGridRowGroupsPreProcessing(privateApiRef);
  useGridLocaleText(privateApiRef, props);

  return privateApiRef;
};
