'use client';
import * as React from 'react';
import clsx from 'clsx';
import { HeaderToolbarProps } from './HeaderToolbar.types';
import { ViewSwitcher } from './view-switcher';
import { useTranslations } from '../internals/utils/TranslationsContext';
import { useEventCallback } from '../../base-ui-copy/utils/useEventCallback';
import { useEventCalendarStore } from '../internals/hooks/useEventCalendarStore';
import { getAdapter } from '../../primitives/utils/adapter/getAdapter';
import './HeaderToolbar.css';

const adapter = getAdapter();

export const HeaderToolbar = React.forwardRef(function HeaderToolbar(
  props: HeaderToolbarProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, ...other } = props;
  const translations = useTranslations();
  const store = useEventCalendarStore();

  const goToToday = useEventCallback(() => {
    store.apply({
      visibleDate: adapter.date(),
    });
  });

  return (
    <header ref={forwardedRef} className={clsx('HeaderToolbarContainer', className)} {...other}>
      <ViewSwitcher />
      <button className="HeaderToolbarButton" onClick={goToToday} type="button">
        {translations.today}
      </button>
    </header>
  );
});
