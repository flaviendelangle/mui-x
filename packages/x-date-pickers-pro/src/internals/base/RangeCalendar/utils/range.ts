import { PickerRangeValue } from '@mui/x-date-pickers/internals';
import { MuiPickersAdapter, PickerValidDate } from '@mui/x-date-pickers/models';
// eslint-disable-next-line no-restricted-imports
import { BaseCalendarSection } from '@mui/x-date-pickers/internals/base/utils/base-calendar/utils/types';

export function getDatePositionInRange({
  utils,
  date,
  range,
  section,
}: {
  utils: MuiPickersAdapter;
  date: PickerValidDate;
  range: PickerRangeValue;
  section: BaseCalendarSection;
}) {
  const [start, end] = range;
  if (start == null && end == null) {
    return { isSelected: false, isSelectionStart: false, isSelectionEnd: false };
  }

  const sectionMethods = getCalendarSectionMethods(utils, section);
  if (start == null) {
    const isSelected = sectionMethods.isSame(date, end!);
    return {
      isSelected,
      isSelectionStart: isSelected,
      isSelectionEnd: isSelected,
    };
  }

  if (end == null) {
    const isSelected = sectionMethods.isSame(date, start!);
    return {
      isSelected,
      isSelectionStart: isSelected,
      isSelectionEnd: isSelected,
    };
  }

  if (utils.isBefore(end, start)) {
    return {
      isSelected: false,
      isSelectionStart: false,
      isSelectionEnd: false,
    };
  }

  return {
    isSelected: utils.isWithinRange(date, [
      sectionMethods.startOf(start),
      sectionMethods.endOf(end),
    ]),
    isSelectionStart: sectionMethods.isSame(date, start),
    isSelectionEnd: sectionMethods.isSame(date, end),
  };
}

/**
 * Create a range going for the start of the first selected cell to the end of the last selected cell.
 * This makes sure that `isWithinRange` works with any time in the start and end day.
 */
export function getRoundedRange({
  utils,
  range,
  section,
}: {
  utils: MuiPickersAdapter;
  range: PickerRangeValue;
  section: BaseCalendarSection;
}): PickerRangeValue {
  const sectionMethods = getCalendarSectionMethods(utils, section);

  return [
    utils.isValid(range[0]) ? sectionMethods.startOf(range[0]) : null,
    utils.isValid(range[1]) ? sectionMethods.endOf(range[1]) : null,
  ];
}

export function getCalendarSectionMethods(utils: MuiPickersAdapter, section: BaseCalendarSection) {
  if (section === 'year') {
    return { isSame: utils.isSameYear, startOf: utils.startOfYear, endOf: utils.endOfYear };
  }
  if (section === 'month') {
    return { isSame: utils.isSameMonth, startOf: utils.startOfMonth, endOf: utils.endOfMonth };
  }
  return { isSame: utils.isSameDay, startOf: utils.startOfDay, endOf: utils.endOfDay };
}
