import { GridRowTreeConfig, GridRowId, GridRowsLookup } from '../../../models/gridRows';

export interface GridRowGroupParams {
  ids: GridRowId[];
  idRowsLookup: GridRowsLookup;
}

export interface GridRowGroupingResult {
  tree: GridRowTreeConfig;
  treeDepth: number;
  ids: GridRowId[];
  idRowsLookup: GridRowsLookup;
}

export type GridRowGroupingPreProcessing = (
  params: GridRowGroupParams,
) => GridRowGroupingResult | null;

export interface GridRowGroupsPreProcessingPrivateApi {
  /**
   * Register a column pre-processing and emit an event to re-apply the row grouping pre-processing.
   * @param {string} processingName Name of the pre-processing. Used to clean the previous version of the pre-processing.
   * @param {GridRowGroupingPreProcessing} groupingFunction Grouping function to register.
   */
  registerRowGroupsBuilder: (
    processingName: string,
    groupingFunction: GridRowGroupingPreProcessing | null,
  ) => void;

  /**
   * Apply the first row grouping pre-processing that does not return null.
   * @param {GridRowGroupParams} params The params needed to group the rows.
   * @returns {GridRowGroupingResult} The grouped rows.
   */
  groupRows: (params: GridRowGroupParams) => GridRowGroupingResult;
}
