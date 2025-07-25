---
title: Data Grid - Column recipes
---

# Data Grid - Column customization recipes

<p class="description">Advanced column customization recipes.</p>

## Persisting column width and order

When the `columns` prop reference is updated, the column width and order is reset to the `colDef.width` and the order of the `colDef` object and any updates will be lost.
This is because the Data Grid considers update of the columns prop as a new set of columns, and the previous state is discarded.

To persist the column width and order when the `columns` prop is updated, consider persisting the state of the columns in the userland.

{{"demo": "ColumnSizingPersistWidthOrder.js", "disableAd": true, "bg": "inline"}}

:::warning
[Column ordering](/x/react-data-grid/column-ordering/) is a Pro feature, to use it you must be on a Pro or Premium plan.
:::

### With pivoting [<span class="plan-premium"></span>](/x/introduction/licensing/#premium-plan 'Premium plan')

Pivoting creates columns dynamically, based on the pivoting model and the row data.

To keep the column width of the pivoted grid after `columns` reference is changed, use [`groupingColDef`](/x/api/data-grid/data-grid-premium/#data-grid-premium-prop-groupingColDef) and [`pivotingColDef`](/x/api/data-grid/data-grid-premium/#data-grid-premium-prop-pivotingColDef) props to apply the width updates to the autogenerated columns.

The demo below uses modified version of the `useColumnsState()` from the previous example in combination with a callbacks for grouping and pivoting columns.

{{"demo": "ColumnSizingPersistWidthPivoting.js", "disableAd": true, "bg": "inline"}}
