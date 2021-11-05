import * as React from 'react';
import { GridRowId } from '../../_modules_/grid/models/gridRows';
import { GridVirtualScroller } from '../../_modules_/grid/components/virtualization/GridVirtualScroller';
import { GridVirtualScrollerContent } from '../../_modules_/grid/components/virtualization/GridVirtualScrollerContent';
import { GridVirtualScrollerRenderZone } from '../../_modules_/grid/components/virtualization/GridVirtualScrollerRenderZone';
import { useGridVirtualScroller } from '../../_modules_/grid/hooks/features/virtualization/useGridVirtualScroller';

interface DataGridProVirtualScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectionLookup: Record<string, GridRowId>;
  disableVirtualization?: boolean;
}

const DataGridProVirtualScroller = React.forwardRef<
  HTMLDivElement,
  DataGridProVirtualScrollerProps
>(function DataGridProVirtualScroller(props, ref) {
  const { className, selectionLookup, disableVirtualization, ...other } = props;

  const { getRootProps, getContentProps, getRenderZone, getRows } = useGridVirtualScroller({
    ref,
    selectionLookup,
    disableVirtualization,
  });

  return (
    <GridVirtualScroller className={className} {...getRootProps(other)}>
      <GridVirtualScrollerContent {...getContentProps()}>
        <GridVirtualScrollerRenderZone {...getRenderZone()}>
          {getRows()}
        </GridVirtualScrollerRenderZone>
      </GridVirtualScrollerContent>
    </GridVirtualScroller>
  );
});

export { DataGridProVirtualScroller };
