import * as React from 'react';
import { GridPrivateApiRef } from '../../models/api/gridApiRef';

export const GriPrivateApiContext = React.createContext<GridPrivateApiRef | undefined>(undefined);

if (process.env.NODE_ENV !== 'production') {
  GriPrivateApiContext.displayName = 'GriPrivateApiContext';
}

export const useGridPrivateApiContext = () => {
  const privateApiRef = React.useContext(GriPrivateApiContext);

  if (privateApiRef === undefined) {
    throw new Error(
      [
        'MUI: Could not find the data grid private context.',
        'It looks like you rendered your component outside of a DataGrid or DataGridPro parent component.',
        'This can also happen if you are bundling multiple versions of the data grid.',
      ].join('\n'),
    );
  }

  return privateApiRef;
};
