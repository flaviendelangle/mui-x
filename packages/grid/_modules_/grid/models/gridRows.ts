export type GridRowsProp = Readonly<GridRowModel[]>;

/**
 * @deprecated prefer GridRowModel.
 */
export type GridRowData<T = { [key: string]: any }> = T;

/**
 * The key value object representing the data of a row.
 */
export type GridRowModel<T = { [key: string]: any }> = T;

export type GridUpdateAction = 'delete';

export interface GridRowModelUpdate extends GridRowModel {
  _action?: GridUpdateAction;
}

export interface GridRowTreeNodeConfig {
  /**
   * The grid row id.
   */
  id: GridRowId;

  /**
   * The id of the row children.
   */
  children?: GridRowId[];

  /**
   * Amount of descendants (children, children's children, ...) before the filtering.
   */
  descendantCount?: number;

  /**
   * The row id of the parent (null if this row is a top level row).
   */
  parent: GridRowId | null;

  /**
   * Current expansion status of the row.
   */
  expanded?: boolean;

  /**
   * 0-based depth of the row in the tree.
   */
  depth: number;

  /**
   * The value used to group the children of this row.
   */
  groupingValue: string;

  /**
   * If `true`, this node has been automatically added to fill a gap in the tree structure.
   */
  isAutoGenerated?: boolean;
}

export type GridRowTreeConfig = Record<GridRowId, GridRowTreeNodeConfig>;

export type GridRowsLookup = Record<GridRowId, GridRowModel>;

/**
 * The type of Id supported by the grid.
 */
export type GridRowId = string | number;

export type GridRowEntry = { id: GridRowId; model: GridRowModel };

/**
 * The function to retrieve the id of a [[GridRowModel]].
 */
export type GridRowIdGetter = (row: GridRowModel) => GridRowId;

/**
 * An helper function to check if the id provided is valid.
 *
 * @param {GridRowId} id Id as [[GridRowId]].
 * @param {GridRowModel | Partial<GridRowModel>} row Row as [[GridRowModel]].
 * @param {string} detailErrorMessage A custom error message to display for invalid IDs
 */
export function checkGridRowIdIsValid(
  id: GridRowId,
  row: GridRowModel | Partial<GridRowModel>,
  detailErrorMessage: string = 'A row was provided without id in the rows prop:',
) {
  if (id == null) {
    throw new Error(
      [
        'MUI: The data grid component requires all rows to have a unique id property.',
        detailErrorMessage,
        JSON.stringify(row),
      ].join('\n'),
    );
  }
}
