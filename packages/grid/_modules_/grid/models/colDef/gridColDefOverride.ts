import { GridColDef } from './gridColDef';

export type GridColDefOverride = Omit<Partial<GridColDef>, 'field'>;

export type GridColDefOverrideCallback = (params: GridColDefOverrideParams) => GridColDefOverride;

export interface GridColDefOverrideParams {
  /**
   * The column we are generating before the override.
   */
  colDef: GridColDef;

  /**
   * The base columns this column is grouping
   */
  sources: GridColDef[];
}
