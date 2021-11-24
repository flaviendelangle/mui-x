import * as React from 'react';
import { GridEventListener } from '../gridEventListener';
import { EventManager, EventListenerOptions } from '../../utils/EventManager';
import { MuiEvent } from '../muiEvent';
import type { GridApi, GridPrivateApi } from './gridApi';

/**
 * The core API interface that is available in the grid `apiRef`.
 */
export interface GridCoreApi {
  /**
   * The react ref of the grid root container div element.
   * @ignore - do not document.
   */
  rootElementRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid column container virtualized div element.
   * @ignore - do not document.
   */
  columnHeadersContainerElementRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid column headers container element.
   * @ignore - do not document.
   */
  columnHeadersElementRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid window container element.
   * @ignore - do not document.
   */
  windowRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid data rendering zone.
   * @ignore - do not document.
   */
  renderingZoneRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid header element.
   * @ignore - do not document.
   */
  headerRef?: React.RefObject<HTMLDivElement>;
  /**
   * The react ref of the grid footer element.
   * @ignore - do not document.
   */
  footerRef?: React.RefObject<HTMLDivElement>;
  /**
   * The generic event emitter manager.
   * @ignore - do not document
   */
  unstable_eventManager: EventManager;
  /**
   * Registers a handler for an event.
   * @param {string} event The name of the event.
   * @param {function} handler The handler to be called.
   * @param {object} options Additional options for this listener.
   * @returns {function} A function to unsubscribe from this event.
   */
  subscribeEvent: <Params, Event extends MuiEvent>(
    event: string,
    handler: GridEventListener<Params, Event>,
    options?: EventListenerOptions,
  ) => () => void;
  /**
   * Emits an event.
   * @param {string} name The name of the event.
   * @param {any} params Arguments to be passed to the handlers.
   * @param {MuiEvent<React.SyntheticEvent | DocumentEventMap[keyof DocumentEventMap]>} event The event object to pass forward.
   */
  publishEvent: (
    name: string,
    params?: any,
    event?: MuiEvent<React.SyntheticEvent | DocumentEventMap[keyof DocumentEventMap]>,
  ) => void;
  /**
   * Displays the error overlay component.
   * @param {any} props Props to be passed to the `ErrorOverlay` component.
   */
  showError: (props: any) => void;
}

export interface GridCorePrivateApi {
  /**
   * Registers a method on the public or private API.
   * @param {'public' | 'private'} visibility The visibility of the methods.
   * @param {Partial<GridApiRef>} methods The methods to register.
   */
  register: <
    V extends 'public' | 'private',
    T extends V extends 'public' ? Partial<GridApi> : Partial<GridPrivateApi>,
  >(
    visibility: V,
    methods: T,
  ) => void;

  /**
   * Returns the public API.
   * Can be useful on a feature hook if we want to pass the `apiRef` to a callback.
   * Do not use it to access the public method in private parts of the codebase.
   * @returns {GridApi} The public api.
   */
  getPublicApi: () => GridApi;
}
