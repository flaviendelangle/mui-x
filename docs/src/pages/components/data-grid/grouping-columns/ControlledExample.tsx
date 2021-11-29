import * as React from 'react';
import {
  DataGridPro,
  GridColumns,
  GridGroupingColumnsModel,
} from '@mui/x-data-grid-pro';
import { useMovieRows } from '@mui/x-data-grid-generator';

const BASE_COLUMNS: GridColumns = [
  { field: 'title', headerName: 'Title' },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
  },
  {
    field: 'company',
    headerName: 'Company',
  },
  {
    field: 'year',
    headerName: 'Year',
  },
];

const INITIAL_GROUPING_COLUMNS_MODEL: GridGroupingColumnsModel = ['company'];

const hideGroupedColumns = (model: GridGroupingColumnsModel): GridColumns =>
  BASE_COLUMNS.map((col) => ({
    ...col,
    hide: col.hide ?? model.includes(col.field),
  }));

const getRowId = (row) => row.title;

export default function ControlledExample() {
  const movies = useMovieRows();

  const [groupingColumnsModel, setGroupingColumnsModel] =
    React.useState<GridGroupingColumnsModel>(INITIAL_GROUPING_COLUMNS_MODEL);
  const [columns, setColumns] = React.useState<GridColumns>(() =>
    hideGroupedColumns(INITIAL_GROUPING_COLUMNS_MODEL),
  );

  const handleGroupingColumnsModelChange = React.useCallback(
    (model: GridGroupingColumnsModel) => {
      setGroupingColumnsModel(model);
      setColumns(hideGroupedColumns(model));
    },
    [],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={movies}
        columns={columns}
        groupingColDef={{ width: 250 }}
        getRowId={getRowId}
        groupingColumnsModel={groupingColumnsModel}
        onGroupingColumnsModelChange={handleGroupingColumnsModelChange}
        groupingColumnsPanel
      />
    </div>
  );
}
