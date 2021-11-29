---
title: Data Grid - Grouping columns
---

# Data Grid - Grouping columns [<span class="plan-premium"></span>](https://mui.com/store/items/material-ui-pro/)

<p class="description">Use grouping columns to group the rows according to one or several columns value</p>

> ⚠️ This feature is temporarily available in beta on the pro plan.
> It will be moved to the premium plan once available.

## Group the rows

### Initializing the grouping columns

If you want to initialize the grouping columns without controlling them, you can provide the model to the `initialState` prop:

```ts
initialState={{
    groupingColumns: {
        model: ['director', 'category']
    }
}}
```

{{"demo": "pages/components/data-grid/grouping-columns/InitialStateExample.js", "bg": "inline", "defaultCodeOpen": false}}

### Controlling the grouping columns

If you want to fully control the grouping columns, you can provide the model to the `groupingColumnsModel` prop.
Use it together with `onGroupingColumnsModelChange` to know when a grouping criteria is added or removed.

{{"demo": "pages/components/data-grid/grouping-columns/ControlledExample.js", "bg": "inline", "defaultCodeOpen": false}}

### Using the grouping panel

To enable the grouping panel, you simply have to use the `groupingColumnsPanel` prop:

{{"demo": "pages/components/data-grid/grouping-columns/RowGroupingPanel.js", "bg": "inline", "defaultCodeOpen": false}}

### Group with object values

If you want to group according to a column which values are objects, you can use the `keyGetter` property in `GridColDef` to transform this object into a serializable value.

> ⚠ For now, the row grouping is not using the `valueGetter` property in `GridColDef`. In the future, it should use it and the `keyGetter` property would only be necessary when the value returned by `valueGetter` is an object.

{{"demo": "pages/components/data-grid/grouping-columns/KeyGetterExample.js", "bg": "inline", "defaultCodeOpen": false}}

## Grouping columns

### Single grouping column

By default, the grid will create only one grouping column even if you have several grouping fields:

{{"demo": "pages/components/data-grid/grouping-columns/SingleGroupingColumn.js", "bg": "inline", "defaultCodeOpen": false}}

### Multiple grouping column

To have a grouping column for each grouping fields, set the `groupingColumnMode` prop to `multiple`:

{{"demo": "pages/components/data-grid/grouping-columns/MultipleGroupingColumn.js", "bg": "inline", "defaultCodeOpen": false}}

### Show values for the leaf

By default, the leaf nodes don't render anything for their grouping cell.

If you want to display some value, you can provide a `leafField` property to the `groupingColDef`.

> ⚠️ If the column whose field is given in `groupingColDef` has a `renderCell` or a `valueGetter`, it will not be called for the grouping cell.

{{"demo": "pages/components/data-grid/grouping-columns/LeafWithValue.js", "bg": "inline", "defaultCodeOpen": false}}

## Full Example

{{"demo": "pages/components/data-grid/grouping-columns/RowGroupingFullExample.js", "bg": "inline", "defaultCodeOpen": false}}

## API

- [DataGrid](/api/data-grid/data-grid/)
- [DataGridPro](/api/data-grid/data-grid-pro/)
