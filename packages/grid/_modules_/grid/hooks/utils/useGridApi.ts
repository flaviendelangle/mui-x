import { GridApiRef } from '../../models/api/gridApiRef';

/**
 * @deprecated Use `apiRef.current` instead.
 */
export const useGridApi = (apiRef: GridApiRef) => apiRef.current;
