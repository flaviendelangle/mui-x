---
title: Data Grid - Group & Pivot
---

# Data Grid - Group & Pivot

<p class="description">Use grouping, pivoting and more to analyse the data in depth.</p>

## Row grouping [<span class="plan-premium"></span>](https://mui.com/store/items/material-ui-pro/)

Use grouping columns to group the rows according to one or several columns value</p>

> ⚠️ This feature is temporarily available in beta on the pro plan.
> It will be moved to the premium plan once available.

### Set grouping columns

#### Initializing the grouping columns

If you want to initialize the grouping columns without controlling them, you can provide the model to the `initialState` prop:

```ts
initialState={{
    groupingColumns: {
        model: ['director', 'category']
    }
}}
```

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsInitialState.js", "bg": "inline", "defaultCodeOpen": false}}

#### Controlling the grouping columns

If you want to fully control the grouping columns, you can provide the model to the `groupingColumnsModel` prop.
Use it together with `onGroupingColumnsModelChange` to know when a grouping criteria is added or removed.

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsControlled.js", "bg": "inline", "defaultCodeOpen": false}}

#### Using the grouping panel

To enable the grouping panel, you simply have to use the `groupingColumnsPanel` prop:

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsPanel.js", "bg": "inline", "defaultCodeOpen": false}}

### Grouping column mode

#### Single grouping column

By default, the grid will create only one grouping column even if you have several grouping fields:

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsSingleGroupingCol.js", "bg": "inline", "defaultCodeOpen": false}}

#### Multiple grouping column

To have a grouping column for each grouping fields, set the `groupingColumnMode` prop to `multiple`:

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsMultipleGroupingCol.js", "bg": "inline", "defaultCodeOpen": false}}

### Custom grouping columns

Use the `groupingColDef` prop to customize the rendering of the grouping column. You can override any property of the `GridColDef` interface except the `field` and the properties related to the edition.

If you want to apply your overrides to every grouping column, use the object format of `groupingColDef`:

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsCustomGroupingColDefObject.js", "bg": "inline", "defaultCodeOpen": false}}

If you want to only override properties of certain grouping columns or to apply different overrides based on the current grouping criteria, use the callback format of `groupingColDef`. It will be called for each grouping column with the list of the columns used to build it:

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsCustomGroupingColDefCallback.js", "bg": "inline", "defaultCodeOpen": false}}

#### Show values for the leaves

By default, the leaves nodes don't render anything for their grouping cell.

If you want to display some value, you can provide a `leafField` property to the `groupingColDef`.

> ⚠️ If the column whose field is given in `groupingColDef` has a `renderCell` or a `valueGetter`, it will not be called for the grouping cell.

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsLeafWithValue.js", "bg": "inline", "defaultCodeOpen": false}}

#### Hide the descendant count

You can use the `hideDescendantCount` property of the `groupingColDef` to hide the amount of descendant of a grouping row.

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsHideDescendantCount.js", "bg": "inline", "defaultCodeOpen": false}}

### Complex grouping value

If you want to group according to a column which values are objects, you can use the `keyGetter` property in `GridColDef` to transform this object into a serializable value.

```ts
const columns: GridColumns = [
  {
    field: 'composer',
    keyGetter: (params) => params.value.name,
  },
  // ...
];
```

> ⚠️ For now, the row grouping is not using the `valueGetter` property in `GridColDef`. In the future, it should use it and the `keyGetter` property would only be necessary when the value returned by `valueGetter` is an object.

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsKeyGetter.js", "bg": "inline", "defaultCodeOpen": false}}

### Group expansion

Use the `defaultGroupingExpansionDepth` prop to expand all the groups up to a given depth when loading the data.
If you want to expand the whole tree, set `defaultGroupingExpansionDepth = -1`

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsDefaultExpansionDepth.js", "bg": "inline", "defaultCodeOpen": false}}

Use the `setRowChildrenExpansion` method on `apiRef` to programmatically set the expansion of a row.

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsSetChildrenExpansion.js", "bg": "inline", "defaultCodeOpen": false}}

### Sorting / Filtering

#### Single grouping column

When using `groupingColumnMode = "single"`, the default behavior is to apply the `sortComparator` and `filterOperators` of the top level grouping criteria.

If you are rendering leaves with the `leafField` property of `groupColDef`, the sorting and filtering will be applied on the leaves based on the `sortComparator` and `filterOperators` of their original column.

In both cases, you can force the sorting and filtering to be applied on another grouping criteria with the `mainGroupingCriteria` property of `groupColDef`

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsSortingSingleGroupingColDef.js", "bg": "inline", "defaultCodeOpen": false}}

#### Multiple grouping column

When using `groupingColumnMode = "multiple"`, the default behavior is to apply the `sortComparator` and `filterOperators` of the grouping criteria of each grouping column.

If you are rendering leaves on one of those columns with the `leafField` property of `groupColDef`, the sorting and filtering will be applied on the leaves for this grouping column based on the `sortComparator` and `filterOperators` of the leave's original column.

If you want to render leaves but apply the sorting and filtering on the grouping criteria of the column, you can force it by setting the `mainGroupingCriteria` property `groupColDef` to be equal to the grouping field.

In the example below:

- the sorting and filtering of the `company` grouping column is applied on the `company` field
- the sorting and filtering of the `director` grouping column is applied on the `director` field even though it has leaves

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsSortingMultipleGroupingColDef.js", "bg": "inline", "defaultCodeOpen": false}}

> ⚠️ If you are dynamically switching the `leafField` or `mainGroupingCriteria`, the sorting and filtering models will not automatically be cleaned-up and the sorting / filtering will not be re-applied.

### Full example

{{"demo": "pages/components/data-grid/group-pivot/GroupingColumnsFullExample.js", "bg": "inline", "defaultCodeOpen": false}}

## Tree Data [<span class="plan-pro"></span>](https://mui.com/store/items/material-ui-pro/)

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

{{"demo": "pages/components/data-grid/group-pivot/TreeDataSimple.js", "bg": "inline", "defaultCodeOpen": false}}

### Gaps in the tree

If some entries are missing to build the full tree, the `DataGridPro` will automatically create rows to fill those gaps.

{{"demo": "pages/components/data-grid/group-pivot/TreeDataWithGap.js", "bg": "inline", "defaultCodeOpen": false}}

### Filtering

A node is included if one of the following criteria is met:

- at least one of its descendant is passing the filters
- it is passing the filters

By default, the filtering is applied to every depth of the tree.
You can limit the filtering to the top level rows with the `disableChildrenFiltering` prop.

{{"demo": "pages/components/data-grid/group-pivot/TreeDataDisableChildrenFiltering.js", "bg": "inline", "defaultCodeOpen": false}}

### Sorting

By default, the sorting is applied to every depth of the tree.
You can limit the sorting to the top level rows with the `disableChildrenSorting` prop.

{{"demo": "pages/components/data-grid/group-pivot/TreeDataDisableChildrenSorting.js", "bg": "inline", "defaultCodeOpen": false}}

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

### Full example

{{"demo": "pages/components/data-grid/group-pivot/TreeDataFullExample.js", "bg": "inline", "defaultCodeOpen": false}}

## 🚧 Master detail [<span class="plan-pro"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #211](https://github.com/mui-org/material-ui-x/issues/211) if you want to see it land faster.

The feature allows to display row details on an expandable pane.

## 🚧 Aggregation [<span class="plan-premium"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #213](https://github.com/mui-org/material-ui-x/issues/213) if you want to see it land faster.

When grouping, you will be able to apply an aggregation function to populate the group row with values.

## 🚧 Pivoting [<span class="plan-premium"></span>](https://mui.com/store/items/material-ui-pro/)

> ⚠️ This feature isn't implemented yet. It's coming.
>
> 👍 Upvote [issue #214](https://github.com/mui-org/material-ui-x/issues/214) if you want to see it land faster.

Pivoting will allow you to take a columns values and turn them into columns.

## API

- [DataGrid](/api/data-grid/data-grid/)
- [DataGridPro](/api/data-grid/data-grid-pro/)
