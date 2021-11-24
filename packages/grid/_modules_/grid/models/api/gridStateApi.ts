import { GridState } from '../gridState';
import { GridControlStateItem } from '../controlStateItem';

export interface GridStateApi {
  /**
   * Property that contains the whole state of the grid.
   */
  state: GridState;
  /**
   * Forces the grid to rerender. It's often used after a state update.
   */
  forceUpdate: () => void;
  /**
   * Sets the whole state of the grid.
   * @param {GridState | (oldState: GridState) => GridState} state The new state or the callback creating the new state.
   * @returns {boolean} Has the state been updated.
   */
  setState: (state: GridState | ((previousState: GridState) => GridState)) => boolean;
}

export interface GridStatePrivateApi {
  /**
   * Updates a control state that binds the model, the onChange prop, and the grid state together.
   * @param {GridControlStateItem} controlState The [[GridControlStateItem]] to be registered.
   */
  updateControlState: <TModel>(controlState: GridControlStateItem<TModel>) => void;
}
