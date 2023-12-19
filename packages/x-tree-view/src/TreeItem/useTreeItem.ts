import * as React from 'react';
import { useTreeViewContext } from '../internals/TreeViewProvider/useTreeViewContext';
import { DefaultTreeViewPlugins } from '../internals/plugins';

export function useTreeItem(nodeId: string) {
  const { instance, multiSelect, checkboxSelection } = useTreeViewContext<DefaultTreeViewPlugins>();

  const expandable = instance ? instance.isNodeExpandable(nodeId) : false;
  const expanded = instance ? instance.isNodeExpanded(nodeId) : false;
  const focused = instance ? instance.isNodeFocused(nodeId) : false;
  const selected = instance ? instance.isNodeSelected(nodeId) : false;
  const disabled = instance ? instance.isNodeDisabled(nodeId) : false;

  const handleExpansion = (event: React.MouseEvent<HTMLDivElement>) => {
    if (instance && !disabled) {
      if (!focused) {
        instance.focusNode(event, nodeId);
      }

      const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

      // If already expanded and trying to toggle selection don't close
      if (expandable && !(multiple && instance.isNodeExpanded(nodeId))) {
        instance.toggleNodeExpansion(event, nodeId);
      }
    }
  };

  const handleSelection = (event: React.ChangeEvent | React.MouseEvent) => {
    if (instance && !disabled) {
      if (!focused) {
        instance.focusNode(event, nodeId);
      }

      const nativeEvent = (event.type === 'change'
        ? event.nativeEvent
        : event) as unknown as React.MouseEvent;

      const multiple =
        multiSelect && (nativeEvent.shiftKey || nativeEvent.ctrlKey || nativeEvent.metaKey);

      if (multiple) {
        if (nativeEvent.shiftKey) {
          instance.selectRange(event, { end: nodeId });
        } else {
          instance.selectNode(event, nodeId, true);
        }
      } else {
        instance.selectNode(event, nodeId);
      }
    }
  };

  const preventSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey || disabled) {
      // Prevent text selection
      event.preventDefault();
    }
  };

  return {
    disabled,
    expanded,
    selected,
    focused,
    checkboxSelection,
    handleExpansion,
    handleSelection,
    preventSelection,
  };
}
