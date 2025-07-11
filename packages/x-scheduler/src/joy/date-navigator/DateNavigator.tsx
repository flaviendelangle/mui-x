'use client';
import * as React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateNavigatorProps } from './DateNavigator.types';
import { getAdapter } from '../../primitives/utils/adapter/getAdapter';
import { useTranslations } from '../internals/utils/TranslationsContext';
import './DateNavigator.css';
import { useDateNavigation } from '../internals/hooks/useDateNavigation';
import { useSelector } from '@mui/x-scheduler/base-ui-copy/utils/store';
import { useEventCalendarStore } from '../internals/hooks/useEventCalendarStore';
import { selectors } from '../event-calendar/store';

const adapter = getAdapter();

export const DateNavigator = React.forwardRef(function DateNavigator(
  props: DateNavigatorProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, ...other } = props;
  const translations = useTranslations();
  const store = useEventCalendarStore();
  const currentView = useSelector(store, selectors.currentView);
  const visibleDate = useSelector(store, selectors.visibleDate);

  const { goToNext, goToPrevious } = useDateNavigation();

  return (
    <header
      ref={forwardedRef}
      role="navigation"
      className={clsx('DateNavigatorContainer', className)}
      {...other}
    >
      <p className="DateNavigatorLabel" aria-live="polite">
        {adapter.format(visibleDate, 'month')} {adapter.format(visibleDate, 'year')}
      </p>
      <div className="DateNavigatorButtonsContainer">
        <button
          className={clsx('NeutralTextButton', 'Button', 'DateNavigatorButton')}
          onClick={goToPrevious}
          type="button"
          aria-label={translations.previousTimeSpan(currentView)}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <button
          className={clsx('NeutralTextButton', 'Button', 'DateNavigatorButton')}
          onClick={goToNext}
          type="button"
          aria-label={translations.nextTimeSpan(currentView)}
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
});
