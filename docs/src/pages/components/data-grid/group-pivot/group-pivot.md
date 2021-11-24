---
title: Data Grid - Group & Pivot
---

# Data Grid - Group & Pivot

<p class="description">Use grouping, pivoting and more to analyse the data in depth.</p>

## Tree Data [<span class="pro"></span>](https://mui.com/store/items/material-ui-pro/)

Tree Data allows to display data with parent / child relationships.

To enable the Tree Data, you simply have to use the `treeData` prop as well as provide a `getTreeDataPath` prop.
The `getTreeDataPath` function returns an array of strings which represents the path to a given row.

```tsx
// The following examples will both render the same tree
// - Sarah
//     - Thomas
//         - Robert
//         - Karen

const columns: GridColumns = [{ field: 'jobTitle', width: 250 }];

// Without transformation
const rows: GridRowsProp = [
  { path: ['Sarah'], jobTitle: 'CEO', id: 0 },
  { path: ['Sarah', 'Thomas'], jobTitle: 'Head of Sales', id: 1 },
  { path: ['Sarah', 'Thomas', 'Robert'], jobTitle: 'Sales Person', id: 2 },
  { path: ['Sarah', 'Thomas', 'Karen'], jobTitle: 'Sales Person', id: 3 },
];

<DataGridPro
  treeData
  getTreeDataPath={(row) => row.path}
  rows={rows}
  columns={columns}
/>;

// With transformation
const rows: GridRowsProp = [
  { path: 'Sarah', jobTitle: 'CEO', id: 0 },
  { path: 'Sarah/Thomas', jobTitle: 'Head of Sales', id: 1 },
  { path: 'Sarah/Thomas/Robert', jobTitle: 'Sales Person', id: 2 },
  { path: 'Sarah/Thomas/Karen', jobTitle: 'Sales Person', id: 3 },
];

<DataGridPro
  treeData
  getTreeDataPath={(row) => row.path.split('/')}
  rows={rows}
  columns={columns}
/>;
```

{{"demo": "pages/components/data-grid/group-pivot/tree-data/BasicTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

### Custom grouping column

Use the `groupingColDef` prop to customize the rendering of the grouping column.

{{"demo": "pages/components/data-grid/group-pivot/tree-data/CustomGroupingColumnTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

### Group expansion

Use the `defaultGroupingExpansionDepth` prop to expand all the groups up to a given depth when loading the data.
If you want to expand the whole tree, set `defaultGroupingExpansionDepth = -1`

{{"demo": "pages/components/data-grid/group-pivot/tree-data/DefaultGroupingExpansionDepthTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

Use the `setRowChildrenExpansion` method on `apiRef` to programmatically set the expansion of a row.

{{"demo": "pages/components/data-grid/group-pivot/tree-data/SetRowExpansionTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

### Gaps in the tree

If some entries are missing to build the full tree, the `DataGridPro` will automatically create rows to fill those gaps.

{{"demo": "pages/components/data-grid/group-pivot/tree-data/TreeDataWithGap.js", "bg": "inline", "defaultCodeOpen": false}}

### Filtering

A node is included if one of the following criteria is met:

- at least one of its descendant is passing the filters
- it is passing the filters

By default, the filtering is applied to every depth of the tree.
You can limit the filtering to the top level rows with the `disableChildrenFiltering` prop.

{{"demo": "pages/components/data-grid/group-pivot/tree-data/DisableChildrenFilteringTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

### Sorting

By default, the sorting is applied to every depth of the tree.
You can limit the sorting to the top level rows with the `disableChildrenSorting` prop.

{{"demo": "pages/components/data-grid/group-pivot/tree-data/DisableChildrenSortingTreeData.js", "bg": "inline", "defaultCodeOpen": false}}

> If you are using `sortingMode="server"`, you need to always put the children of a row after its parent.
> For instance:
>
> ```ts
> // ✅ The row A.A is immediately after its parent
> const validRows = [{ path: ['A'] }, { path: ['A', 'A'] }, { path: ['B'] }];
>
> // ❌ The row A.A is not immediately after its parent
> const invalidRows = [{ path: ['A'] }, { path: ['B'] }, { path: ['A', 'A'] }];
> ```

### Full Example

{{"demo": "pages/components/data-grid/group-pivot/tree-data/TreeDataFullExample.js", "bg": "inline", "defaultCodeOpen": false}}

## 🚧 Master detail [<span class="pro"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #211](https://github.com/mui-org/material-ui-x/issues/211) if you want to see it land faster.

The feature allows to display row details on an expandable pane.

## 🚧 Row Grouping [<span class="premium"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature is temporarily available in beta on the pro plan.
> It will be moved to the premium plan once available.

To enable the grouping, you simply have to set the `groupRows` property in `GridColDef`

```tsx
const columns: GridColDef[] = [
  { field: 'director', groupRows: true },
  { field: 'company', groupRows: true },
];
```

### Single grouping column

By default, the grid will create only one grouping column even if you have several grouping fields:

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/SingleGroupingColumn.js", "bg": "inline", "defaultCodeOpen": false}}

### Multiple grouping column

To have a grouping column for each grouping fields, set the `groupingColumnMode` prop to `multiple`:

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/MultipleGroupingColumn.js", "bg": "inline", "defaultCodeOpen": false}}

### Group order

By default, the rows are grouped based on the order of the columns.
To manually set a grouping order, you can use the `groupRowIndex` property in `GridColDef`

```tsx
const columns: GridColDef[] = [
  { field: 'director', groupRows: true, groupRowIndex: 1 },
  { field: 'company', groupRows: true, groupRowIndex: 0 },
];
```

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/CustomGroupOrder.js", "bg": "inline", "defaultCodeOpen": false}}

### Group with object values

If you want to group according to a column which values are objects, you can use the `keyGetter` property in `GridColDef` to transform this object into a serializable value.

> For now, the row grouping is not using the `valueGetter` property in `GridColDef`. In the future, it should use it and the `keyGetter` property would only be necessary when the value returned by `valueGetter` is an object.

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/KeyGetterExample.js", "bg": "inline", "defaultCodeOpen": false}}

### Grouping panel

To enable the grouping panel, you simply have to use the `rowGroupByColumnPanel` prop:

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/RowGroupingPanel.js", "bg": "inline", "defaultCodeOpen": false}}

### Full Example

{{"demo": "pages/components/data-grid/group-pivot/row-group-by-columns/RowGroupingFullExample.js", "bg": "inline", "defaultCodeOpen": false}}

## 🚧 Aggregation [<span class="premium"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #213](https://github.com/mui-org/material-ui-x/issues/213) if you want to see it land faster.

When grouping, you will be able to apply an aggregation function to populate the group row with values.

## 🚧 Pivoting [<span class="premium"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #214](https://github.com/mui-org/material-ui-x/issues/214) if you want to see it land faster.

Pivoting will allow you to take a columns values and turn them into columns.

## API

- [DataGrid](/api/data-grid/data-grid/)
- [DataGridPro](/api/data-grid/data-grid-pro/)
