import * as React from 'react';
import PropTypes from 'prop-types';
import {
  DataGridPro,
  useGridApiContext,
  useGridSelector,
  gridVisibleDescendantCountLookupSelector,
  GridEvents,
} from '@mui/x-data-grid-pro';
import { useDemoTreeData } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export const isNavigationKey = (key) =>
  key === 'Home' ||
  key === 'End' ||
  key.indexOf('Arrow') === 0 ||
  key.indexOf('Page') === 0 ||
  key === ' ';

const CustomGridTreeDataGroupingCell = (props) => {
  const { id } = props;
  const apiRef = useGridApiContext();
  const descendantCountLookup = useGridSelector(
    apiRef,
    gridVisibleDescendantCountLookupSelector,
  );

  const node = apiRef.current.UNSTABLE_getRowNode(id);
  const descendantCount = descendantCountLookup[id];

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
    if (isNavigationKey(event.key) && !event.shiftKey) {
      apiRef.current.publishEvent(GridEvents.cellNavigationKeyDown, props, event);
    }
  };

  if (!node) {
    throw new Error(`MUI: No row with id #${id} found`);
  }

  return (
    <Box sx={{ ml: node.depth * 4 }}>
      <div>
        {descendantCount > 0 ? (
          <Button
            onClick={() =>
              apiRef.current.UNSTABLE_setRowExpansion(id, !node?.expanded)
            }
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            size="small"
          >
            See {descendantCount} children
          </Button>
        ) : (
          <span />
        )}
      </div>
    </Box>
  );
};

CustomGridTreeDataGroupingCell.propTypes = {
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

const groupingColDef = {
  renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} />,
};

export default function CustomGroupingColumnTreeData() {
  const { data, loading } = useDemoTreeData({
    rowLength: [10, 5, 3],
    randomLength: true,
  });

  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGridPro
        loading={loading}
        treeData
        disableSelectionOnClick
        groupingColDef={groupingColDef}
        {...data}
      />
    </div>
  );
}
