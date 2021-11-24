import React from 'react';
import { GridComponentProps } from '../../GridComponentProps';
import { GridPrivateApiRef } from '../../models/api/gridApiRef';
import { GridStateApi, GridStatePrivateApi } from '../../models/api/gridStateApi';
import { GridControlStateItem } from '../../models/controlStateItem';
import { GridSignature } from '../utils/useGridApiEventHandler';
import { GridState } from '../../models';
import { GridEvents } from '../../constants';

export const useGridStateInitialization = (
  apiRef: GridPrivateApiRef,
  props: GridComponentProps,
) => {
  const controlStateMapRef = React.useRef<Record<string, GridControlStateItem<any>>>({});
  const [, rawForceUpdate] = React.useState<GridState>();

  const updateControlState = React.useCallback<GridStatePrivateApi['updateControlState']>(
    (controlStateItem) => {
      const { stateId, ...others } = controlStateItem;

      controlStateMapRef.current[stateId] = {
        ...others,
        stateId,
      };
    },
    [],
  );

  const setState = React.useCallback<GridStateApi['setState']>(
    (state) => {
      let newState: GridState;
      if (typeof state === 'function') {
        newState = state(apiRef.current.state);
      } else {
        newState = state;
      }

      if (apiRef.current.state === newState) {
        return false;
      }

      let ignoreSetState = false;
      const updatedStateIds: string[] = [];
      const controlStateMap = controlStateMapRef.current!;

      Object.keys(controlStateMap).forEach((stateId) => {
        const controlState = controlStateMap[stateId];
        const oldSubState = controlState.stateSelector(apiRef.current.state);
        const newSubState = controlState.stateSelector(newState);

        if (newSubState === oldSubState) {
          return;
        }

        if (newSubState !== controlState.propModel) {
          updatedStateIds.push(controlState.stateId);
        }

        // The state is controlled, the prop should always win
        if (controlState.propModel !== undefined && newSubState !== controlState.propModel) {
          ignoreSetState = true;
        }
      });

      if (updatedStateIds.length > 1) {
        // Each hook modify its own state and it should not leak
        // Events are here to forward to other hooks and apply changes.
        // You are trying to update several states in a no isolated way.
        throw new Error(
          `You're not allowed to update several sub-state in one transaction. You already updated ${
            updatedStateIds[0]
          }, therefore, you're not allowed to update ${updatedStateIds.join(
            ', ',
          )} in the same transaction.`,
        );
      }

      if (!ignoreSetState) {
        // We always assign it as we mutate rows for perf reason.
        apiRef.current.state = newState;

        if (apiRef.current.publishEvent) {
          apiRef.current.publishEvent(GridEvents.stateChange, newState);
        }
      }

      updatedStateIds.forEach((stateId) => {
        const controlState = controlStateMap[stateId];
        const model = controlStateMap[stateId].stateSelector(newState);

        if (controlState.propOnChange) {
          const details =
            props.signature === GridSignature.DataGridPro ? { api: apiRef.current } : {};
          controlState.propOnChange(model, details);
        }

        apiRef.current.publishEvent(controlState.changeEvent, model);
      });

      return !ignoreSetState;
    },
    [apiRef, props.signature],
  );

  const forceUpdate = React.useCallback(() => rawForceUpdate(() => apiRef.current.state), [apiRef]);

  const statePublicApi: Omit<GridStateApi, 'state'> = {
    setState,
    forceUpdate,
  };

  const statePrivateApi: GridStatePrivateApi = {
    updateControlState,
  };

  apiRef.current.register('public', statePublicApi);
  apiRef.current.register('private', statePrivateApi);
};
