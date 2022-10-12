import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useIsLandscape } from '../hooks/useIsLandscape';
import { CalendarOrClockPickerView } from '../models/views';

export interface PickerViewContainerProps<TView extends CalendarOrClockPickerView> {
  children: React.ReactNode;
  /**
   * Array of views to show.
   */
  views: readonly TView[];
  /**
   * Force rendering in particular orientation.
   */
  orientation?: 'portrait' | 'landscape';
}

export const PickerViewContainerRoot = styled('div')<{ ownerState: { isLandscape: boolean } }>(
  ({ ownerState }) => ({
    display: 'flex',
    flexDirection: 'column',
    ...(ownerState.isLandscape && {
      flexDirection: 'row',
    }),
  }),
);

export function PickerViewContainer<TView extends CalendarOrClockPickerView>(
  props: PickerViewContainerProps<TView>,
) {
  const { orientation, views, children } = props;
  const isLandscape = useIsLandscape(views, orientation);

  return <PickerViewContainerRoot ownerState={{ isLandscape }}>{children}</PickerViewContainerRoot>;
}
