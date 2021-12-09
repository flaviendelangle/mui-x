import { useDemoData } from '@mui/x-data-grid-generator';
import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';

const hideGroupedColumns = (columns, model) =>
  columns.map((col) => ({
    ...col,
    hide: col.hide ?? model.includes(col.field),
  }));

export default function GroupingColumnsFullExample() {
  const { data, loading } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 25,
  });

  const [state, setState] = React.useState(() => ({
    groupingColumnsModel: ['status', 'counterPartyCurrency'],
    columns: hideGroupedColumns(data.columns, ['status', 'counterPartyCurrency']),
  }));

  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      columns: hideGroupedColumns(data.columns, prev.groupingColumnsModel),
    }));
  }, [data.columns]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        loading={loading}
        disableSelectionOnClick
        {...data}
        {...state}
        groupingColumnMode="multiple"
        onGroupingColumnsModelChange={(model) =>
          setState({
            groupingColumnsModel: model,
            columns: hideGroupedColumns(data.columns, model),
          })
        }
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
