import * as React from 'react';
import { GridApiContext } from '../components/GridApiContext';
import { GridRootPropsContext } from './GridRootPropsContext';
import { GriPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';

export const GridContextProvider = ({ apiRef, privateApiRef, props, children }) => {
  return (
    <GridRootPropsContext.Provider value={props}>
      <GriPrivateApiContext.Provider value={privateApiRef}>
        <GridApiContext.Provider value={apiRef}>{children}</GridApiContext.Provider>
      </GriPrivateApiContext.Provider>
    </GridRootPropsContext.Provider>
  );
};
