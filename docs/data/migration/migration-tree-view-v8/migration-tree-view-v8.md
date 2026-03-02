---
title: Tree View - Migration from v8 to v9
productId: x-tree-view
---

# Migration from v8 to v9

<p class="description">This guide describes the changes needed to migrate the Tree View from v8 to v9.</p>

## Introduction

This is a reference guide for upgrading `@mui/x-tree-view` from v8 to v9.

:::success
This guide is also available in <a href="https://raw.githubusercontent.com/mui/mui-x/refs/heads/next/docs/data/migration/migration-tree-view-v8/migration-tree-view-v8.md" target="_blank">Markdown format</a> to be referenced by AI tools like Copilot or Cursor to help you with the migration.
:::

## Start using the new release

In `package.json`, change the version of the Tree View package to `next`.

```diff
-"@mui/x-tree-view": "^8.x.x",
+"@mui/x-tree-view": "next",

-"@mui/x-tree-view-pro": "^8.x.x",
+"@mui/x-tree-view-pro": "next",
```

Since `v9` is a major release, it contains changes that affect the public API.
These changes were done for consistency, improved stability and to make room for new features.
Described below are the steps needed to migrate from `v8` to `v9`.

## Breaking changes

### Removed `TreeViewBaseItem` type

The deprecated `TreeViewBaseItem` type has been removed.

If you were using `TreeViewBaseItem` without a generic parameter, replace it with `TreeViewDefaultItemModelProperties`:

```diff
-import { TreeViewBaseItem } from '@mui/x-tree-view/models';
+import { TreeViewDefaultItemModelProperties } from '@mui/x-tree-view/models';

-const items: TreeViewBaseItem[] = [
+const items: TreeViewDefaultItemModelProperties[] = [
   { id: '1', label: 'Item 1', children: [{ id: '1.1', label: 'Item 1.1' }] },
 ];
```

If you were using `TreeViewBaseItem` with a generic parameter, define your own type with a `children` property instead:

```diff
-import { TreeViewBaseItem } from '@mui/x-tree-view/models';
-
-type CustomItem = TreeViewBaseItem<{
-  id: string;
-  label: string;
-  isActive?: boolean;
-}>;
+type CustomItem = {
+  id: string;
+  label: string;
+  isActive?: boolean;
+  children?: CustomItem[];
+};
```

### Removed `useTreeViewApiRef` hook

The deprecated `useTreeViewApiRef` hook has been removed.
Use one of the specific API ref hooks instead:

```diff
-import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
+import { useRichTreeViewApiRef } from '@mui/x-tree-view/hooks';

-const apiRef = useTreeViewApiRef();
+const apiRef = useRichTreeViewApiRef();
```

The available hooks are:

- `useRichTreeViewApiRef` for `<RichTreeView />`
- `useRichTreeViewProApiRef` for `<RichTreeViewPro />` (from `@mui/x-tree-view-pro/hooks`)
- `useSimpleTreeViewApiRef` for `<SimpleTreeView />`

### Removed deprecated Tree Item state CSS classes

The following deprecated state CSS classes have been removed from `treeItemClasses`:

| Removed class | Replacement |
| :-- | :-- |
| `treeItemClasses.expanded` | `[data-expanded]` attribute selector |
| `treeItemClasses.selected` | `[data-selected]` attribute selector |
| `treeItemClasses.focused` | `[data-focused]` attribute selector |
| `treeItemClasses.disabled` | `[data-disabled]` attribute selector |
| `treeItemClasses.editable` | `[data-editable]` attribute selector |
| `treeItemClasses.editing` | `[data-editing]` attribute selector |

If you were using these classes to style the Tree Items, use the data attribute selectors instead:

```diff
 const StyledTreeItemContent = styled(TreeItemContent)(({ theme }) => ({
-  [`&.${treeItemClasses.selected}`]: {
+  [`&[data-selected]`]: {
     backgroundColor: theme.palette.primary.light,
   },
-  [`&.${treeItemClasses.focused}`]: {
+  [`&[data-focused]`]: {
     outline: `2px solid ${theme.palette.primary.main}`,
   },
-  [`&.${treeItemClasses.disabled}`]: {
+  [`&[data-disabled]`]: {
     opacity: 0.5,
   },
 }));
```

### Removed `status` prop from the content slot props

The deprecated `status` prop has been removed from the content slot props (`UseTreeItemContentSlotOwnProps`).
If you were using `status` in a styled component receiving the content slot props, use data attribute selectors instead:

```diff
 const CustomContent = styled(TreeItemContent)(({
   theme,
-  status,
 }) => ({
-  ...(status.selected && {
-    backgroundColor: theme.palette.primary.light,
-  }),
-  ...(status.focused && {
-    outline: `2px solid ${theme.palette.primary.main}`,
-  }),
+  '&[data-selected]': {
+    backgroundColor: theme.palette.primary.light,
+  },
+  '&[data-focused]': {
+    outline: `2px solid ${theme.palette.primary.main}`,
+  },
 }));
```

:::info
The `status` object returned by `useTreeItem()` is still available and can be used in component logic (event handlers, effects, conditional rendering).
Only the prop passed to the content slot styled component has been removed.
:::
