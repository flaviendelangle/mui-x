import * as React from 'react';
import { GridApiRef } from '../../models/api/gridApiRef';
import { GridApi } from '../../models/api/gridApi';
import { useGridLogger } from './useGridLogger';

/**
 * @deprecated Will be removed from the public API. For private use, use `apiRef.current.register` instead.
 */
export function useGridApiMethod<T extends Partial<GridApi>>(
  apiRef: GridApiRef,
  apiMethods: T,
  apiName: string,
) {
  const logger = useGridLogger(apiRef, 'useGridApiMethod');
  const apiMethodsRef = React.useRef(apiMethods);
  const [apiMethodsNames] = React.useState(Object.keys(apiMethods));

  const installMethods = React.useCallback(() => {
    if (!apiRef.current) {
      return;
    }
    apiMethodsNames.forEach((methodName) => {
      if (!apiRef.current.hasOwnProperty(methodName)) {
        logger.debug(`Adding ${apiName}.${methodName} to apiRef`);
        apiRef.current[methodName] = (...args) => apiMethodsRef.current[methodName](...args);
      }
    });
  }, [apiMethodsNames, apiName, apiRef, logger]);

  React.useEffect(() => {
    apiMethodsRef.current = apiMethods;
  }, [apiMethods]);

  React.useEffect(() => {
    installMethods();
  }, [installMethods]);

  installMethods();
}
