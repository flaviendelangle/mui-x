import { useDemoData } from '@mui/x-data-grid-generator';
import * as React from 'react';
import {
  DataGridPro,
  DataGridProProps,
  GridColumns,
  GridGroupingColumnsModel,
} from '@mui/x-data-grid-pro';

const hideGroupedColumns = (
  columns: GridColumns,
  model: GridGroupingColumnsModel,
): GridColumns =>
  columns.map((col) => ({
    ...col,
    hide: col.hide ?? model.includes(col.field),
  }));

export default function RowGroupingFullExample() {
  const { data, loading } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 25,
  });

  const [state, setState] = React.useState<
    Pick<DataGridProProps, 'columns' | 'groupingColumnsModel'>
  >(() => ({
    groupingColumnsModel: ['status', 'counterPartyCurrency'],
    columns: hideGroupedColumns(data.columns, ['status', 'counterPartyCurrency']),
  }));

  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      columns: hideGroupedColumns(data.columns, prev.groupingColumnsModel!),
    }));
  }, [data.columns]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        loading={loading}
        disableSelectionOnClick
        {...data}
        {...state}
        groupingColumnsPanel
        groupingColumnMode="multiple"
        onGroupingColumnsModelChange={(model) =>
          setState({
            groupingColumnsModel: model,
            columns: hideGroupedColumns(data.columns, model),
          })
        }
      />
    </div>
  );
}
