import * as React from 'react';
import { useSlotProps } from '@mui/base/utils';
import { useLicenseVerifier, Watermark } from '@mui/x-license';
import { RichTreeViewItems } from '@mui/x-tree-view/internals';
import { styled } from '../internals/zero-styled';
import { useTreeViewVirtualScroller } from './useTreeViewVirtualScroller';
import { TreeViewVirtualScrollerProps } from './TreeViewVirtualScroller.types';
import { getReleaseInfo } from '../internals/utils/releaseInfo';
import { TreeViewVirtualScrollbar } from './TreeViewVirtualScrollbar';

const TreeViewVirtualScrollerRoot = styled('div', {
  name: 'MuiTreeViewVirtualScroller',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  flexGrow: 1,
  position: 'relative',
  overflow: 'hidden',
});

const TreeViewVirtualScrollerContent = styled('div', {
  name: 'MuiTreeViewVirtualScroller',
  slot: 'Content',
  overridesResolver: (props, styles) => styles.content,
})({
  position: 'relative',
  height: '100%',
  overflow: 'scroll',
  scrollbarWidth: 'none' /* Firefox */,
  '&::-webkit-scrollbar': {
    display: 'none' /* Safari and Chrome */,
  },

  '@media print': {
    overflow: 'hidden',
  },

  // See https://github.com/mui/mui-x/issues/10547
  zIndex: 0,
});

const releaseInfo = getReleaseInfo();

export const TreeViewVirtualScroller = React.forwardRef(function TreeViewVirtualScroller(
  props: TreeViewVirtualScrollerProps,
  ref: React.Ref<HTMLUListElement>,
) {
  const { slots, slotProps, ...other } = props;

  useLicenseVerifier('x-tree-view-pro', releaseInfo);
  const { getRootProps, getContentProps, getScrollbarProps, getItemsToRender } =
    useTreeViewVirtualScroller();

  const Root = slots.root;
  const rootProps = useSlotProps({
    elementType: Root,
    getSlotProps: getRootProps,
    externalForwardedProps: other,
    externalSlotProps: slotProps?.root,
    additionalProps: {
      ref,
    },
    ownerState: props,
  });

  return (
    <TreeViewVirtualScrollerRoot as={Root} {...rootProps}>
      <TreeViewVirtualScrollerContent {...getContentProps()}>
        <RichTreeViewItems slots={slots} slotProps={slotProps} itemsToRender={getItemsToRender()} />
      </TreeViewVirtualScrollerContent>
      <TreeViewVirtualScrollbar {...getScrollbarProps()} />
      <Watermark packageName="x-tree-view-pro" releaseInfo={releaseInfo} />
    </TreeViewVirtualScrollerRoot>
  );
});
