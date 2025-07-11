import { getAdapter } from '../../../primitives/utils/adapter/getAdapter';
import { ViewType } from '../../models/views';
import { SchedulerValidDate } from '../../../primitives/models';
import { useEventCallback } from '../../../base-ui-copy/utils/useEventCallback';
import { useEventCalendarStore } from './useEventCalendarStore';

const adapter = getAdapter();

function getNavigationDate(view: ViewType, visibleDate: SchedulerValidDate, delta: number) {
  switch (view) {
    case 'day':
      return adapter.addDays(visibleDate, delta);
    case 'month':
      return adapter.addMonths(adapter.startOfMonth(visibleDate), delta);
    case 'agenda':
      return adapter.addDays(visibleDate, 12 * delta);
    case 'week':
    default:
      return adapter.addWeeks(adapter.startOfWeek(visibleDate), delta);
  }
}

export function useDateNavigation() {
  const store = useEventCalendarStore();

  const goToNext = useEventCallback(() => {
    store.apply({
      visibleDate: getNavigationDate(store.state.currentView, store.state.visibleDate, 1),
    });
  });

  const goToPrevious = useEventCallback(() => {
    store.apply({
      visibleDate: getNavigationDate(store.state.currentView, store.state.visibleDate, -1),
    });
  });

  return {
    goToNext,
    goToPrevious,
  };
}
