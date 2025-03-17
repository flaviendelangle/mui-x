import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TreeItemNonStateClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the content element. */
  content: string;
  /** Styles applied to the transition component. */
  groupTransition: string;
  /** Styles applied to the Tree Item icon. */
  iconContainer: string;
  /** Styles applied to the label element. */
  label: string;
  /** Styles applied to the checkbox element. */
  checkbox: string;
  /** Styles applied to the input element that is visible when editing is enabled. */
  labelInput: string;
  /** Styles applied to the drag and drop overlay. */
  dragAndDropOverlay: string;
}

export interface TreeItemClasses extends TreeItemNonStateClasses {
  /** State class applied to the content element when expanded. */
  expanded: string;
  /** State class applied to the content element when selected. */
  selected: string;
  /** State class applied to the content element when focused. */
  focused: string;
  /** State class applied to the element when disabled. */
  disabled: string;
  /** Styles applied to the content of the items that are editable. */
  editable: string;
  /** Styles applied to the content element when editing is enabled. */
  editing: string;
}

export type TreeItemClassKey = keyof TreeItemClasses;

export function getTreeItemUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTreeItem', slot);
}

export const treeItemClasses: TreeItemClasses = generateUtilityClasses('MuiTreeItem', [
  'root',
  'content',
  'groupTransition',
  'iconContainer',
  'label',
  'checkbox',
  'labelInput',
  'dragAndDropOverlay',
  // State classes, will be replaced by data-attrs in the next major
  'expanded',
  'selected',
  'focused',
  'disabled',
  'editable',
  'editing',
]);
