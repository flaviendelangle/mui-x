import * as React from 'react';
import {
  DataGridPro,
  gridVisibleSortedRowIdsSelector,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function GroupingColumnsSetChildrenExpansion() {
  const apiRef = useGridApiRef();
  const data = useMovieData();

  const columns = React.useMemo(
    () =>
      data.columns.map((colDef) =>
        ['company'].includes(colDef.field) ? { ...colDef, hide: true } : colDef,
      ),
    [data.columns],
  );

  const toggleSecondRow = () => {
    const rowIds = gridVisibleSortedRowIdsSelector(apiRef.current.state);

    if (rowIds.length > 1) {
      const rowId = rowIds[1];
      apiRef.current.setRowChildrenExpansion(
        rowId,
        !apiRef.current.getRowNode(rowId)?.childrenExpanded,
      );
    }
  };

  return (
    <Stack style={{ width: '100%' }} alignItems="flex-start" spacing={2}>
      <Button onClick={toggleSecondRow}>Toggle 2nd row expansion</Button>
      <div style={{ height: 400, width: '100%' }}>
        <DataGridPro
          {...data}
          columns={columns}
          apiRef={apiRef}
          disableSelectionOnClick
          initialState={{
            groupingColumns: {
              model: ['company'],
            },
          }}
          experimentalFeatures={{
            groupingColumns: true,
          }}
        />
      </div>
    </Stack>
  );
}
