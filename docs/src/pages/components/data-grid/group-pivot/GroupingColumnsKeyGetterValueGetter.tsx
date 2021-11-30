import * as React from 'react';
import {
  DataGridPro,
  GridColumns,
  GridKeyGetterParams,
  GridRenderCellParams,
} from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

type Decade = { value: number; name: string };

export default function GroupingColumnsKeyGetter() {
  const data = useMovieData();

  const columns = React.useMemo<GridColumns>(
    () => [
      ...data.columns,
      {
        field: 'decade',
        headerName: 'Decade',
        hide: true,
        valueGetter: (params): Decade | null => {
          const value = Math.floor(params.row.year / 10) * 10;

          if (params.row.year == null) {
            return null;
          }

          return {
            value,
            name: `${value.toString().slice(-2)}'s`,
          };
        },
        keyGetter: (params: GridKeyGetterParams<Decade | null>) =>
          params.value?.value,
        renderCell: (params: GridRenderCellParams<Decade | null>) =>
          params.value?.name,
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
            model: ['decade'],
          },
        }}
      />
    </div>
  );
}
