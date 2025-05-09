import * as React from 'react';
import { PickerValidDate } from '../../../../models';
import { useUtils } from '../../../hooks/useUtils';
import { useBaseCalendarRootContext } from '../../utils/base-calendar/root/BaseCalendarRootContext';
import { BaseCalendarYearCollectionContext } from '../../utils/base-calendar/utils/BaseCalendarYearCollectionContext';
import { useRegisterSection } from '../../utils/base-calendar/utils/useRegisterSection';
import { useBaseCalendarRootVisibleDateContext } from '../../utils/base-calendar/root/BaseCalendarRootVisibleDateContext';
import { useScrollableList } from '../../utils/useScrollableList';

export function useYearCells(parameters: useYearCells.Parameters): useYearCells.ReturnValue {
  const { getItems, focusOnMount, children } = parameters;
  const baseRootContext = useBaseCalendarRootContext();
  const baseRootVisibleDateContext = useBaseCalendarRootVisibleDateContext();
  const utils = useUtils();
  const ref = React.useRef<HTMLDivElement>(null);

  const items = React.useMemo(() => {
    const getDefaultItems = () =>
      utils.getYearRange([
        baseRootContext.dateValidationProps.minDate,
        baseRootContext.dateValidationProps.maxDate,
      ]);
    if (getItems) {
      return getItems({
        visibleDate: baseRootVisibleDateContext.visibleDate,
        minDate: baseRootContext.dateValidationProps.minDate,
        maxDate: baseRootContext.dateValidationProps.maxDate,
        getDefaultItems,
      });
    }

    return getDefaultItems();
  }, [
    utils,
    getItems,
    baseRootVisibleDateContext.visibleDate,
    baseRootContext.dateValidationProps.minDate,
    baseRootContext.dateValidationProps.maxDate,
  ]);

  useScrollableList({ focusOnMount, ref });
  useRegisterSection({
    section: 'year',
    value: baseRootVisibleDateContext.visibleDate,
  });

  const canCellBeTabbed = React.useMemo(() => {
    let tabbableCells: PickerValidDate[];
    const selectedAndVisibleCells = items.filter((day) =>
      baseRootContext.selectedDates.some((selectedDay) => utils.isSameYear(day, selectedDay)),
    );
    if (selectedAndVisibleCells.length > 0) {
      tabbableCells = selectedAndVisibleCells;
    } else {
      const currentYear = items.find((day) => utils.isSameYear(day, baseRootContext.currentDate));
      if (currentYear != null) {
        tabbableCells = [currentYear];
      } else {
        tabbableCells = items.slice(0, 1);
      }
    }

    const format = `${utils.formats.year}/${utils.formats.month}`;
    const formattedTabbableCells = new Set(
      tabbableCells.map((day) => utils.formatByString(day, format)),
    );

    return (date: PickerValidDate) =>
      formattedTabbableCells.has(utils.formatByString(date, format));
  }, [baseRootContext.currentDate, baseRootContext.selectedDates, items, utils]);

  const yearsListOrGridContext = React.useMemo<BaseCalendarYearCollectionContext>(
    () => ({
      canCellBeTabbed,
    }),
    [canCellBeTabbed],
  );

  const resolvedChildren = React.useMemo(() => {
    if (!React.isValidElement(children) && typeof children === 'function') {
      return children({ years: items });
    }

    return children;
  }, [children, items]);

  return { resolvedChildren, ref, yearsListOrGridContext };
}

export namespace useYearCells {
  export interface Parameters extends useScrollableList.PublicParameters {
    /**
     * Generate the list of items to render.
     * @param {GetItemsParameters} parameters The current parameters of the list.
     * @returns {PickerValidDate[]} The list of items.
     */
    getItems?: (parameters: GetItemsParameters) => PickerValidDate[];
    /**
     * The children of the component.
     * If a function is provided, it will be called with the list of the years to render as its parameter.
     */
    children?: React.ReactNode | ((parameters: ChildrenParameters) => React.ReactNode);
  }

  export interface ChildrenParameters {
    years: PickerValidDate[];
  }

  export interface GetItemsParameters {
    /**
     * The visible date.
     */
    visibleDate: PickerValidDate;
    /**
     * The minimum valid date of the calendar.
     */
    minDate: PickerValidDate;
    /**
     * The maximum valid date of the calendar.
     */
    maxDate: PickerValidDate;
    /**
     * A function that returns the items that would be rendered if getItems is not provided.
     * @returns {PickerValidDate[]} The list of the items to render.
     */
    getDefaultItems: () => PickerValidDate[];
  }

  export interface ReturnValue {
    yearsListOrGridContext: BaseCalendarYearCollectionContext;
    resolvedChildren: React.ReactNode;
    ref: React.RefObject<HTMLDivElement | null>;
  }
}
