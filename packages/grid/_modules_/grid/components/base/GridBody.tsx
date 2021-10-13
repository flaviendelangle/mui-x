import * as React from 'react';
import PropTypes from 'prop-types';
import { GridEvents } from '../../constants/eventsConstants';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { ElementSize } from '../../models/elementSize';
import { GridColumnsHeader } from '../columnHeaders/GridColumnHeaders';
import { GridColumnsContainer } from '../containers/GridColumnsContainer';
import { GridMainContainer } from '../containers/GridMainContainer';
import { GridAutoSizer } from '../GridAutoSizer';
import { GridOverlays } from './GridOverlays';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridVirtualizedContainer } from '../GridVirtualizedContainer';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { gridSelectionStateSelector } from '../../hooks/features/selection/gridSelectionSelector';
import { gridDensityHeaderHeightSelector } from '../../hooks/features/density/densitySelector';
import { GridScrollArea } from '../GridScrollArea';

interface GridBodyProps {
  children?: React.ReactNode;
}

function GridBody(props: GridBodyProps) {
  const { children } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const selection = useGridSelector(apiRef, gridSelectionStateSelector);
  const headerHeight = useGridSelector(apiRef, gridDensityHeaderHeightSelector);

  const columnsHeaderRef = React.useRef<HTMLDivElement>(null);
  const columnsContainerRef = React.useRef<HTMLDivElement>(null);
  const windowRef = React.useRef<HTMLDivElement>(null);
  const renderingZoneRef = React.useRef<HTMLDivElement>(null);

  apiRef.current.columnHeadersContainerElementRef = columnsContainerRef;
  apiRef.current.columnHeadersElementRef = columnsHeaderRef;
  apiRef.current.windowRef = windowRef; // TODO rename, it's not attached to the window anymore
  apiRef.current.renderingZoneRef = renderingZoneRef; // TODO remove, nobody should have access to internal parts of the virtualization

  const handleResize = React.useCallback(
    (size: ElementSize) => apiRef.current.publishEvent(GridEvents.resize, size),
    [apiRef],
  );

  const filteredSelection = React.useMemo(
    () =>
      typeof rootProps.isRowSelectable === 'function'
        ? selection.filter((id) => rootProps.isRowSelectable!(apiRef.current.getRowParams(id)))
        : selection,
    [apiRef, rootProps.isRowSelectable, selection],
  );

  const selectionLookup = React.useMemo(
    () =>
      filteredSelection.reduce((lookup, rowId) => {
        lookup[rowId] = rowId;
        return lookup;
      }, {}),
    [filteredSelection],
  );

  return (
    <GridMainContainer>
      <GridOverlays />
      <GridScrollArea scrollDirection="left" />
      <GridColumnsContainer ref={columnsContainerRef}>
        <GridColumnsHeader ref={columnsHeaderRef} />
      </GridColumnsContainer>
      <GridScrollArea scrollDirection="right" />
      <GridAutoSizer
        nonce={rootProps.nonce}
        disableHeight={rootProps.autoHeight}
        onResize={handleResize}
      >
        {(size: { height?: number; width: number }) => {
          const style = {
            width: size.width,
            // If `autoHeight` is on, there will be no height value.
            // In this case, let the container to grow whatever it needs.
            height: size.height ? size.height - headerHeight : 'auto',
            marginTop: headerHeight,
          };

          return (
            <GridVirtualizedContainer
              ref={windowRef}
              style={style}
              selectionLookup={selectionLookup} // TODO pass it directly to the row via componentsProps
            />
          );
        }}
      </GridAutoSizer>
      {children}
    </GridMainContainer>
  );
}

GridBody.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
} as any;

export { GridBody };
