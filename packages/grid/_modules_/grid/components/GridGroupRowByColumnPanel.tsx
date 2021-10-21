import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { GridEvents } from '../constants/eventsConstants';
import { GridColDef, GridColumnHeaderParams } from '../models';
import { gridRowGroupingColumnSelector } from '../hooks/features/rowGroupByColumns';
import { orderGroupingFields } from '../hooks/features/rowGroupByColumns/rowGroupByColumnsUtils';
import { GridDragIcon } from './icons';

const GridGroupRowByColumnPanelRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'GroupRowByColumnPanel',
})({
  display: 'flex',
  alignItems: 'stretch',
  height: 48,
});

const GridGroupingChipContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1, 2),
}));

const GridGroupingEmptySpace = styled('div')({
  flex: '1 1 auto',
});

/**
 * Only available in DataGridPro
 */
export const GridGroupRowByColumnPanel = () => {
  const apiRef = useGridApiContext();
  const [colHeaderDragField, setColHeaderDragField] = React.useState('');
  const [chipDragField, setChipDragField] = React.useState('');
  const groupingColumns = useGridSelector(apiRef, gridRowGroupingColumnSelector);
  const groupingFields = React.useMemo(
    () => orderGroupingFields(groupingColumns),
    [groupingColumns],
  );

  const handleColumnReorderStart = React.useCallback(
    (params: GridColumnHeaderParams) => setColHeaderDragField(params.field),
    [],
  );
  const handleColumnReorderStop = React.useCallback(() => setColHeaderDragField(''), []);

  const handleDragStartChip = (field: string) => setChipDragField(field);

  const handleDragEndChip = () => setChipDragField('');

  const handleDragEnter = (targetField: string | null) => {
    const dragField = colHeaderDragField || chipDragField;

    if (!dragField || targetField === dragField) {
      return;
    }

    let newGroupingFields: string[];
    if (!targetField) {
      newGroupingFields = [...groupingFields.filter((field) => field !== dragField), dragField];
    } else {
      const currentDragFieldPosition = groupingFields.findIndex((field) => field === dragField);
      const currentTargetFieldPosition = groupingFields.findIndex((field) => field === targetField);

      if (currentDragFieldPosition < currentTargetFieldPosition) {
        newGroupingFields = [
          ...(currentDragFieldPosition > 0
            ? groupingFields.slice(0, currentDragFieldPosition)
            : []),
          ...groupingFields.slice(currentDragFieldPosition + 1, currentTargetFieldPosition),
          targetField,
          dragField,
          ...groupingFields.slice(currentTargetFieldPosition + 1),
        ];
      } else {
        newGroupingFields = [
          ...groupingFields.slice(0, currentTargetFieldPosition),
          ...groupingFields.slice(currentTargetFieldPosition + 1, currentDragFieldPosition),
          dragField,
          targetField,
          ...groupingFields.slice(currentDragFieldPosition + 1),
        ];
      }
    }

    const colUpdates: GridColDef[] = newGroupingFields.map((field, fieldIndex) => {
      const col: GridColDef = {
        field,
        groupRows: true,
        groupRowIndex: fieldIndex,
      };

      if (field === colHeaderDragField) {
        col.hide = true;
      }

      return col;
    });

    apiRef.current.updateColumns(colUpdates);
  };

  const handleRemoveGroupingCol = (field: string) =>
    apiRef.current.updateColumn({
      ...apiRef.current.getColumn(field),
      hide: false,
      groupRows: false,
      groupRowIndex: undefined,
    });

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnReorderStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleColumnReorderStop);

  return (
    <GridGroupRowByColumnPanelRoot>
      {groupingFields.map((field) => {
        const label = groupingColumns[field].headerName ?? field;

        return (
          <GridGroupingChipContainer key={field} onDragEnter={() => handleDragEnter(field)}>
            <Chip
              label={label}
              draggable
              onDragStart={() => handleDragStartChip(field)}
              onDragEnd={() => handleDragEndChip()}
              onDelete={() => handleRemoveGroupingCol(field)}
              icon={<GridDragIcon />}
            />
          </GridGroupingChipContainer>
        );
      })}
      <GridGroupingEmptySpace onDragEnter={() => handleDragEnter(null)} />
    </GridGroupRowByColumnPanelRoot>
  );
};
