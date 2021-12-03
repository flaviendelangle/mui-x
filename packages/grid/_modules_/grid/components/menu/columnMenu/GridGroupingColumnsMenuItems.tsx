import * as React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';
import { GridColDef } from '../../../models/colDef/gridColDef';
import { useGridSelector } from '../../../hooks/utils/useGridSelector';
import { gridGroupingRowsSanitizedModelSelector } from '../../../hooks/features/groupingColumns/gridGroupingColumnsSelector';
import {
  getGroupingCriteriaFieldFromGroupingColDefField,
  GROUPING_COLUMN_SINGLE,
  isGroupingColumn,
} from '../../../hooks/features/groupingColumns/gridGroupingColumnsUtils';

interface GridColumnPinningMenuItemsProps {
  column?: GridColDef;
  onClick?: (event: React.MouseEvent<any>) => void;
}

const GridGroupingColumnsMenuItems = (props: GridColumnPinningMenuItemsProps) => {
  const { column, onClick } = props;
  const apiRef = useGridApiContext();
  const groupingColumnsModel = useGridSelector(apiRef, gridGroupingRowsSanitizedModelSelector);

  const isGrouped = React.useMemo(
    () => column?.field && groupingColumnsModel.includes(column.field),
    [column, groupingColumnsModel],
  );

  const groupColumn = (event: React.MouseEvent<HTMLElement>, field: string) => {
    apiRef.current.addGroupingField(field, true);

    if (onClick) {
      onClick(event);
    }
  };

  const ungroupColumn = (event: React.MouseEvent<HTMLElement>, field: string) => {
    apiRef.current.removeGroupingField(field, true);

    if (onClick) {
      onClick(event);
    }
  };

  if (!column) {
    return null;
  }

  if (isGroupingColumn(column.field)) {
    if (column.field === GROUPING_COLUMN_SINGLE) {
      return (
        <React.Fragment>
          {groupingColumnsModel.map((groupingField) => (
            <MenuItem onClick={(event) => ungroupColumn(event, groupingField)}>
              {apiRef.current.getLocaleText('unGroupColumn')(groupingField)}
            </MenuItem>
          ))}
        </React.Fragment>
      );
    }

    const groupingCriteriaField = getGroupingCriteriaFieldFromGroupingColDefField(column.field)!;
    return (
      <MenuItem onClick={(event) => ungroupColumn(event, groupingCriteriaField)}>
        {apiRef.current.getLocaleText('unGroupColumn')(groupingCriteriaField)}
      </MenuItem>
    );
  }

  if (isGrouped) {
    return (
      <MenuItem onClick={(event) => ungroupColumn(event, column.field)}>
        {apiRef.current.getLocaleText('unGroupColumn')(column.field)}
      </MenuItem>
    );
  }

  if (!column.canBeGrouped) {
    return null;
  }

  return (
    <MenuItem onClick={(event) => groupColumn(event, column.field)}>
      {apiRef.current.getLocaleText('groupColumn')(column.field)}
    </MenuItem>
  );
};

GridGroupingColumnsMenuItems.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  column: PropTypes.object,
  onClick: PropTypes.func,
} as any;

export { GridGroupingColumnsMenuItems };
