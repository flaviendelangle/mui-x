import * as React from 'react';
import {
  DataGridPro,
  GridColumns,
  GridGroupingColumnsModel,
} from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

const hideGroupedColumns = (
  columns: GridColumns,
  model: GridGroupingColumnsModel,
): GridColumns =>
  columns.map((col) => ({
    ...col,
    hide: col.hide ?? model.includes(col.field),
  }));

export default function GroupingColumnsControlled() {
  const data = useMovieData();

  const [groupingColumnsModel, setGroupingColumnsModel] =
    React.useState<GridGroupingColumnsModel>(['company']);

  const columns = React.useMemo(
    () => hideGroupedColumns(data.columns, groupingColumnsModel),
    [data.columns, groupingColumnsModel],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        columns={columns}
        groupingColumnsModel={groupingColumnsModel}
        onGroupingColumnsModelChange={(model) => setGroupingColumnsModel(model)}
      />
    </div>
  );
}
