import * as React from 'react';
import { EventHandlers } from '@mui/utils/types';
import { TreeViewInstance } from './treeView';
import type { MergeSignaturesProperty, OptionalIfEmpty } from './helpers';
import { TreeViewEventLookupElement } from './events';
import type { TreeViewCorePluginSignatures } from '../corePlugins';
import { TreeViewItemPlugin } from './itemPlugin';
import { TreeViewItemId } from '../../models';
import { TreeViewStore } from '../utils/TreeViewStore';

export interface TreeViewPluginOptions<TSignature extends TreeViewAnyPluginSignature> {
  /**
   * An imperative API available for internal use. Used to access methods from other plugins.
   */
  instance: TreeViewUsedInstance<TSignature>;
  /**
   * The Tree View parameters after being processed with the default values.
   */
  params: TreeViewUsedParamsWithDefaults<TSignature>;
  /**
   * The store that can be used to access the state of other plugins.
   */
  store: TreeViewUsedStore<TSignature>;
  /**
   * Reference to the root element.
   */
  rootRef: React.RefObject<HTMLUListElement | null>;
  /**
   * All the plugins that are used in the tree-view.
   */
  plugins: TreeViewPlugin<TreeViewAnyPluginSignature>[];
}

type TreeViewResponse<TSignature extends TreeViewAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLUListElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']>;

export type TreeViewPluginSignature<
  T extends {
    params?: {};
    paramsWithDefaults?: {};
    instance?: {};
    publicAPI?: {};
    events?: { [key in keyof T['events']]: TreeViewEventLookupElement };
    state?: {};
    dependencies?: readonly TreeViewAnyPluginSignature[];
    optionalDependencies?: readonly TreeViewAnyPluginSignature[];
  },
> = {
  /**
   * The raw properties that can be passed to the plugin.
   */
  params: T extends { params: {} } ? T['params'] : {};
  /**
   * The params after being processed with the default values.
   */
  paramsWithDefaults: T extends { paramsWithDefaults: {} } ? T['paramsWithDefaults'] : {};
  /**
   * An imperative api available for internal use.
   */
  instance: T extends { instance: {} } ? T['instance'] : {};
  /**
   * The public imperative API that will be exposed to the user.
   * Accessed through the `apiRef` property of the plugin.
   */
  publicAPI: T extends { publicAPI: {} } ? T['publicAPI'] : {};
  events: T extends { events: {} } ? T['events'] : {};
  /**
   * The state is the mutable data that will actually be stored in the plugin state and can be accessed by other plugins.
   */
  state: T extends { state: {} } ? T['state'] : {};
  /**
   * Any plugins that this plugin depends on.
   */
  dependencies: T extends { dependencies: Array<any> } ? T['dependencies'] : [];
  /**
   * Same as dependencies but the plugin might not have been initialized. Used for dependencies on plugins of features that can be enabled conditionally.
   */
  optionalDependencies: T extends { optionalDependencies: Array<any> }
    ? T['optionalDependencies']
    : [];
};

export type TreeViewAnyPluginSignature = {
  state: any;
  instance: any;
  params: any;
  paramsWithDefaults: any;
  dependencies: any;
  optionalDependencies: any;
  events: any;
  publicAPI: any;
};

type TreeViewRequiredPlugins<TSignature extends TreeViewAnyPluginSignature> = [
  ...TreeViewCorePluginSignatures,
  ...TSignature['dependencies'],
];

type PluginPropertyWithDependencies<
  TSignature extends TreeViewAnyPluginSignature,
  TProperty extends keyof TreeViewAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<TreeViewRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

export type TreeViewUsedParams<TSignature extends TreeViewAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

export type TreeViewUsedParamsWithDefaults<TSignature extends TreeViewAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'paramsWithDefaults'>;

export type TreeViewUsedInstance<TSignature extends TreeViewAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
    /**
     * Private property only defined in TypeScript to be able to access the plugin signature from the instance object.
     */
    $$signature: TSignature;
  };

export type TreeViewUsedStore<TSignature extends TreeViewAnyPluginSignature> = TreeViewStore<
  [TSignature, ...TSignature['dependencies']]
>;

export type TreeViewUsedEvents<TSignature extends TreeViewAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<TreeViewRequiredPlugins<TSignature>, 'events'>;

export type TreeItemWrapper<TSignatures extends readonly TreeViewAnyPluginSignature[]> = (params: {
  itemId: TreeViewItemId;
  children: React.ReactNode;
  instance: TreeViewInstance<TSignatures>;
  idAttribute: string;
}) => React.ReactNode;

export type TreeRootWrapper = (params: { children: React.ReactNode }) => React.ReactNode;

export type TreeViewPlugin<TSignature extends TreeViewAnyPluginSignature> = {
  /**
   * The main function of the plugin that will be executed by the Tree View.
   *
   * This should be a valid React `use` function, as it will be executed in the render phase and can contain hooks.
   */
  (options: TreeViewPluginOptions<TSignature>): TreeViewResponse<TSignature>;
  /**
   * A function that receives the parameters and returns them after being processed with the default values.
   *
   * @param {TreeViewUsedParams<TSignature>} options The options object.
   * @param {TreeViewUsedParams<TSignature>['params']} options.params The parameters before being processed with the default values.
   * @returns {TSignature['paramsWithDefaults']} The parameters after being processed with the default values.
   */
  applyDefaultValuesToParams?: (options: {
    params: TreeViewUsedParams<TSignature>;
  }) => TSignature['paramsWithDefaults'];
  /**
   * The initial state is computed after the default values are applied.
   * It sets up the state for the first render.
   * Other state modifications have to be done in effects and so could not be applied on the initial render.
   *
   * @param {TreeViewUsedParamsWithDefaults<TSignature>} params The parameters after being processed with the default values.
   * @returns {TSignature['state']} The initial state of the plugin.
   */
  getInitialState?: (params: TreeViewUsedParamsWithDefaults<TSignature>) => TSignature['state'];
  /**
   * An object where each property used by the plugin is set to `true`.
   */
  params: Record<keyof TSignature['params'], true>;
  itemPlugin?: TreeViewItemPlugin;
  /**
   * Render function used to add React wrappers around the TreeItem.
   * @param {{ nodeId: TreeViewItemId; children: React.ReactNode; }} params The params of the item.
   * @returns {React.ReactNode} The wrapped item.
   */
  wrapItem?: TreeItemWrapper<[TSignature, ...TSignature['dependencies']]>;
  /**
   * Render function used to add React wrappers around the TreeView.
   * @param {{ children: React.ReactNode; }} params The params of the root.
   * @returns {React.ReactNode} The wrapped root.
   */
  wrapRoot?: TreeRootWrapper;
};
