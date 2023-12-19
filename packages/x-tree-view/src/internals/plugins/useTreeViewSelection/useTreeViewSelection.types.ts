import * as React from 'react';
import type { DefaultizedProps, TreeViewItemRange, TreeViewPluginSignature } from '../../models';
import { UseTreeViewNodesSignature } from '../useTreeViewNodes';
import { UseTreeViewExpansionSignature } from '../useTreeViewExpansion';

export interface UseTreeViewSelectionInstance {
  isNodeSelected: (nodeId: string) => boolean;
  selectNode: (event: React.SyntheticEvent, nodeId: string, multiple?: boolean) => void;
  selectRange: (event: React.SyntheticEvent, nodes: TreeViewItemRange, stacked?: boolean) => void;
  rangeSelectToFirst: (event: React.KeyboardEvent<HTMLUListElement>, nodeId: string) => void;
  rangeSelectToLast: (event: React.KeyboardEvent<HTMLUListElement>, nodeId: string) => void;
}

type TreeViewSelectionValue<Multiple extends boolean | undefined> = Multiple extends true
  ? string[]
  : string | null;

export interface UseTreeViewSelectionParameters<Multiple extends boolean | undefined> {
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection?: boolean;
  /**
   * Selected node ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelected?: TreeViewSelectionValue<Multiple>;
  /**
   * Selected node ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selected?: TreeViewSelectionValue<Multiple>;
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect?: Multiple;
  /**
   * If `true`, the tree view renders a checkbox at the left of its label that allows selecting it.
   * @default false
   */
  checkboxSelection?: boolean;
  /**
   * Callback fired when tree items are selected/unselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} nodeIds Ids of the selected nodes. When `multiSelect` is true
   * this is an array of strings; when false (default) a string.
   */
  onNodeSelect?: (
    event: React.SyntheticEvent,
    nodeIds: Exclude<TreeViewSelectionValue<Multiple>, null>,
  ) => void;
}

export type UseTreeViewSelectionDefaultizedParameters<Multiple extends boolean> = DefaultizedProps<
  UseTreeViewSelectionParameters<Multiple>,
  'disableSelection' | 'defaultSelected' | 'multiSelect' | 'checkboxSelection'
>;

export type UseTreeViewSelectionSignature<Multiple extends boolean | undefined> =
  TreeViewPluginSignature<
    UseTreeViewSelectionParameters<Multiple>,
    UseTreeViewSelectionDefaultizedParameters<Multiple extends undefined ? false : Multiple>,
    UseTreeViewSelectionInstance,
    {},
    {},
    'selected',
    [UseTreeViewNodesSignature, UseTreeViewExpansionSignature, UseTreeViewNodesSignature]
  >;
