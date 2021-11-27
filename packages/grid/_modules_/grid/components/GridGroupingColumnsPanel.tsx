import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { GridEventListener, GridEvents } from '../models/events';
import { gridGroupingRowsSanitizedModelSelector } from '../hooks/features/groupingColumns';
import { gridColumnLookupSelector } from '../hooks/features/columns';
import { GridDragIcon } from './icons';

const GridGroupingColumnsPanelRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'GroupingColumnsPanel',
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
export const GridGroupingColumnsPanel = () => {
  const apiRef = useGridApiContext();
  const [colHeaderDragField, setColHeaderDragField] = React.useState('');
  const [chipDragField, setChipDragField] = React.useState('');
  const groupingColumnsModel = useGridSelector(apiRef, gridGroupingRowsSanitizedModelSelector);
  const columnsLookup = useGridSelector(apiRef, gridColumnLookupSelector);
  const handleColumnReorderStart = React.useCallback<
    GridEventListener<GridEvents.columnHeaderDragStart>
  >((params) => setColHeaderDragField(params.field), []);

  const handleColumnReorderStop = React.useCallback<
    GridEventListener<GridEvents.columnHeaderDragEnd>
  >(() => setColHeaderDragField(''), []);

  const handleDragStartChip = (field: string) => setChipDragField(field);

  const handleDragEndChip = () => setChipDragField('');

  const handleDragEnter = (targetField: string | null) => {
    const dragField = colHeaderDragField || chipDragField;

    if (!dragField || targetField === dragField) {
      return;
    }

    let newGroupingColumnsModel: string[];
    if (!targetField) {
      newGroupingColumnsModel = [
        ...groupingColumnsModel.filter((field) => field !== dragField),
        dragField,
      ];
    } else {
      const currentDragFieldPosition = groupingColumnsModel.findIndex(
        (field) => field === dragField,
      );
      const currentTargetFieldPosition = groupingColumnsModel.findIndex(
        (field) => field === targetField,
      );

      if (currentDragFieldPosition < currentTargetFieldPosition) {
        newGroupingColumnsModel = [
          ...(currentDragFieldPosition > 0
            ? groupingColumnsModel.slice(0, currentDragFieldPosition)
            : []),
          ...groupingColumnsModel.slice(currentDragFieldPosition + 1, currentTargetFieldPosition),
          targetField,
          dragField,
          ...groupingColumnsModel.slice(currentTargetFieldPosition + 1),
        ];
      } else {
        newGroupingColumnsModel = [
          ...groupingColumnsModel.slice(0, currentTargetFieldPosition),
          ...groupingColumnsModel.slice(currentTargetFieldPosition + 1, currentDragFieldPosition),
          dragField,
          targetField,
          ...groupingColumnsModel.slice(currentDragFieldPosition + 1),
        ];
      }
    }

    // TODO: Hide columns when adding them to the groupingColumnsModel
    // const colUpdates: GridColDef[] = newGroupingFields.map((field, fieldIndex) => {
    //   const col: GridColDef = {
    //     field,
    //     groupRows: true,
    //     groupRowIndex: fieldIndex,
    //   };
    //
    //   if (field === colHeaderDragField) {
    //     col.hide = true;
    //   }
    //
    //   return col;
    // });

    apiRef.current.setGroupingColumnsModel(newGroupingColumnsModel);
  };

  const handleRemoveGroupingCol = (field: string) => {
    apiRef.current.setGroupingColumnsModel(groupingColumnsModel.filter((el) => el !== field));
    // TODO: Show column when removing it from groupingColumnsModel
    // apiRef.current.updateColumn({
    //   ...apiRef.current.getColumn(field),
    //   hide: false,
    //   groupRows: false,
    //   groupRowIndex: undefined,
    // });
  };

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnReorderStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleColumnReorderStop);

  return (
    <GridGroupingColumnsPanelRoot>
      {groupingColumnsModel.map((field) => {
        const label = columnsLookup[field].headerName ?? field;

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
    </GridGroupingColumnsPanelRoot>
  );
};
