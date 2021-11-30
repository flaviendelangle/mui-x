import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

const hideGroupedColumns = (columns, model) =>
  columns.map((col) => ({
    ...col,
    hide: col.hide ?? model.includes(col.field),
  }));

export default function GroupingColumnsControlled() {
  const data = useMovieData();

  const [groupingColumnsModel, setGroupingColumnsModel] = React.useState([
    'company',
  ]);

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
        groupingColumnsPanel
      />
    </div>
  );
}
