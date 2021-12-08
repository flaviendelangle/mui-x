import * as React from 'react';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';

import { GridGroupingColumnsPanel } from './GridGroupingColumnsPanel';

export const GridHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function GridHeader(props, ref) {
    const rootProps = useGridRootProps();

    return (
      <div ref={ref} {...props}>
        <rootProps.components.PreferencesPanel {...rootProps.componentsProps?.preferencesPanel} />
        {rootProps.components.Toolbar && (
          <rootProps.components.Toolbar {...rootProps.componentsProps?.toolbar} />
        )}

        {rootProps.groupingColumnsPanel && !rootProps.disableGroupingColumns && (
          <GridGroupingColumnsPanel />
        )}
      </div>
    );
  },
);
