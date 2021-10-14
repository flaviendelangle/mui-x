import * as React from 'react';
import PropTypes from 'prop-types';
import { DataGridPro, useGridSlotComponentProps } from '@mui/x-data-grid-pro';
import { useDemoTreeData } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const CustomGridTreeDataGroupingCell = (props) => {
  const { id } = props;
  const { apiRef } = useGridSlotComponentProps();
  const node = apiRef.current.UNSTABLE_getRowNode(id);

  if (!node) {
    throw new Error(`MUI: No row with id #${id} found`);
  }

  return (
    <Box sx={{ ml: node.depth * 4 }}>
      <div>
        {node.children?.length ? (
          <Button
            onClick={() =>
              apiRef.current.UNSTABLE_setRowExpansion(id, !node?.expanded)
            }
            tabIndex={-1}
            size="small"
          >
            See children
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
