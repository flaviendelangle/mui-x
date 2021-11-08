import * as React from 'react';
import PropTypes from 'prop-types';
import { unstable_composeClasses as composeClasses } from '@mui/core';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { GridRenderCellParams } from '../../models/params/gridCellParams';
import { isNavigationKey, isSpaceKey } from '../../utils/keyboardUtils';
import { GridEvents } from '../../constants';
import { getDataGridUtilityClass } from '../../gridClasses';
import { GridComponentProps } from '../../GridComponentProps';

type OwnerState = { classes: GridComponentProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['treeDataGroupingCell'],
    toggle: ['treeDataGroupingCellToggle'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridTreeDataGroupingCellRoot = styled(Box, {
  name: 'MuiDataGrid',
  slot: 'GridTreeDataGroupingCell',
  overridesResolver: (props, styles) => styles.treeDataGroupingCell,
})({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
});

const GridTreeDataGroupingCellToggle = styled('div', {
  name: 'MuiDataGrid',
  slot: 'GridTreeDataGroupingCellToggle',
  overridesResolver: (props, styles) => styles.treeDataGroupingCellToggle,
})({
  flex: '0 0 28px',
  alignSelf: 'stretch',
  marginRight: 16,
});

export interface GridTreeDataGroupingCellValue {
  label: string;
  filteredDescendantCount: number;
  depth: number;
  expanded: boolean;
}

const GridTreeDataGroupingCell = (props: GridRenderCellParams<GridTreeDataGroupingCellValue>) => {
  const { id, field, value } = props;

  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const ownerState: OwnerState = { classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const Icon = value.expanded
    ? rootProps.components.TreeDataCollapseIcon
    : rootProps.components.TreeDataExpandIcon;

  const handleKeyDown = (event) => {
    if (isSpaceKey(event.key)) {
      event.stopPropagation();
    }
    if (isNavigationKey(event.key) && !event.shiftKey) {
      apiRef.current.publishEvent(GridEvents.cellNavigationKeyDown, props, event);
    }
  };

  const handleClick = (event) => {
    apiRef.current.unstable_setRowExpansion(id, !value.expanded);
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };

  return (
    <GridTreeDataGroupingCellRoot className={classes.root} sx={{ ml: value.depth * 4 }}>
      <GridTreeDataGroupingCellToggle className={classes.toggle}>
        {value.filteredDescendantCount > 0 && (
          <IconButton
            size="small"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            aria-label={
              value.expanded
                ? apiRef.current.getLocaleText('treeDataCollapse')
                : apiRef.current.getLocaleText('treeDataExpand')
            }
          >
            <Icon fontSize="inherit" />
          </IconButton>
        )}
      </GridTreeDataGroupingCellToggle>
      <span>
        {value.label}
        {value.filteredDescendantCount > 0 ? ` (${value.filteredDescendantCount})` : ''}
      </span>
    </GridTreeDataGroupingCellRoot>
  );
};

GridTreeDataGroupingCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: PropTypes.any.isRequired,
  /**
   * The mode of the cell.
   */
  cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: PropTypes.object.isRequired,
  /**
   * The column field of the cell that triggered the event
   */
  field: PropTypes.string.isRequired,
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: PropTypes.shape({
    depth: PropTypes.number.isRequired,
    expanded: PropTypes.bool.isRequired,
    filteredDescendantCount: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  /**
   * Get the cell value of a row and field.
   * @param {GridRowId} id The row id.
   * @param {string} field The field.
   * @returns {GridCellValue} The cell value.
   */
  getValue: PropTypes.func.isRequired,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: PropTypes.bool.isRequired,
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: PropTypes.bool,
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: PropTypes.any.isRequired,
  /**
   * The node of the row that the current cell belongs to.
   */
  rowNode: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    ),
    depth: PropTypes.number.isRequired,
    expanded: PropTypes.bool,
    groupingValue: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    isAutoGenerated: PropTypes.bool,
    parent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  /**
   * the tabIndex value.
   */
  tabIndex: PropTypes.oneOf([-1, 0]).isRequired,
  /**
   * The cell value, but if the column has valueGetter, use getValue.
   */
  value: PropTypes.shape({
    depth: PropTypes.number.isRequired,
    expanded: PropTypes.bool.isRequired,
    filteredDescendantCount: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
} as any;

export { GridTreeDataGroupingCell };
