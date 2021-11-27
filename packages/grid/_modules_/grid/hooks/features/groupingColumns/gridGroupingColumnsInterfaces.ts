export type GridGroupingColumnsModel = string[];

export interface GridGroupingColumnsState {
  model: GridGroupingColumnsModel;
}

export interface GridGroupingColumnsInitialState {
  model?: GridGroupingColumnsModel;
}

export interface GridGroupingColumnsApi {
  /**
   * Sets the columns to use as grouping criteria
   * @param {GridGroupingColumnsModel} model The columns to use as grouping criteria.
   */
  setGroupingColumnsModel: (model: GridGroupingColumnsModel) => void;
}
