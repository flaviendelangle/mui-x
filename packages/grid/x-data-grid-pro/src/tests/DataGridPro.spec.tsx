import * as React from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';

function DataGridProSpec() {
  const apiRef = useGridApiRef();

  React.useEffect(() => {
    // @ts-expect-error Type 'applyPreProcessor' does not exist of type 'GridApi'
    apiRef.current.applyPreProcessors('falseProcessing', null);
  });

  return null;
}
