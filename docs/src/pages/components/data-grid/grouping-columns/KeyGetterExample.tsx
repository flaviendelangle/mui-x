import * as React from 'react';
import {
  DataGridPro,
  GridKeyGetterParams,
  GridRenderCellParams,
} from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function KeyGetterExample() {
  const data = useMovieData();

  const columns = React.useMemo(
    () => [
      ...data.columns,
      {
        field: 'composer',
        headerName: 'Composer',
        renderCell: (params: GridRenderCellParams<{ name: string } | undefined>) =>
          params.value?.name,
        keyGetter: (params: GridKeyGetterParams<{ name: string }>) =>
          params.value.name,
        hide: true,
        width: 200,
      },
    ],
    [data.columns],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        columns={columns}
        initialState={{
          groupingColumns: {
            model: ['composer'],
          },
        }}
      />
    </div>
  );
}
