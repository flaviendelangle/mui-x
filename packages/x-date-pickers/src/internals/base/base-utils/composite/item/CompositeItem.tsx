'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useRenderElement } from '../../useRenderElement';
import { useCompositeRootContext } from '../root/CompositeRootContext';
import { useCompositeItem } from './useCompositeItem';
import { refType } from '../../proptypes';
import type { BaseUIComponentProps } from '../../types';

/**
 * @internal
 */
function CompositeItem<Metadata>(componentProps: CompositeItem.Props<Metadata>) {
  const { render, className, itemRef, metadata, ...elementProps } = componentProps;

  const { highlightedIndex } = useCompositeRootContext();
  const { getItemProps, ref, index } = useCompositeItem({ metadata });

  const state: CompositeItem.State = React.useMemo(
    () => ({
      highlighted: index === highlightedIndex,
    }),
    [index, highlightedIndex],
  );

  const renderElement = useRenderElement('div', componentProps, {
    state,
    ref: [itemRef!, ref],
    props: [getItemProps, elementProps],
  });

  return renderElement();
}

namespace CompositeItem {
  export interface State {
    highlighted: boolean;
  }

  export interface Props<Metadata> extends Omit<BaseUIComponentProps<'div', State>, 'itemRef'> {
    // the itemRef name collides with https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemref
    itemRef?: React.RefObject<HTMLElement | null>;
    metadata?: Metadata;
  }
}

export { CompositeItem };

CompositeItem.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * CSS class applied to the element, or a function that
   * returns a class based on the component’s state.
   */
  className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  /**
   * @ignore
   */
  itemRef: refType,
  /**
   * @ignore
   */
  metadata: PropTypes.any,
  /**
   * Allows you to replace the component’s HTML element
   * with a different tag, or compose it with another component.
   *
   * Accepts a `ReactElement` or a function that returns the element to render.
   */
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
} as any;
