import { MuiPickersAdapter, PickerValidDate } from '../../../models';

export function startOfHour(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  return utils.setSeconds(utils.setMinutes(value, 0), 0);
}

export function endOfHour(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  return utils.setSeconds(utils.setMinutes(value, 59), 59);
}

export function startOfMinute(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  return utils.setSeconds(value, 0);
}

export function endOfMinute(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  return utils.setSeconds(value, 59);
}

export function startOfMeridiem(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  const newHour = utils.getHours(value) > 11 ? 12 : 0;
  return startOfHour(utils, utils.setHours(value, newHour));
}

export function endOfMeridiem(utils: MuiPickersAdapter, value: PickerValidDate): PickerValidDate {
  const newHour = utils.getHours(value) > 11 ? 23 : 11;
  return endOfHour(utils, utils.setHours(value, newHour));
}

export function isSameMinute(
  utils: MuiPickersAdapter,
  value: PickerValidDate,
  comparing: PickerValidDate,
) {
  return (
    utils.isSameHour(value, comparing) && utils.getMinutes(value) === utils.getMinutes(comparing)
  );
}

export function isSameSecond(
  utils: MuiPickersAdapter,
  value: PickerValidDate,
  comparing: PickerValidDate,
) {
  return (
    isSameMinute(utils, value, comparing) && utils.getSeconds(value) === utils.getSeconds(comparing)
  );
}

export function isSameMeridiem(
  utils: MuiPickersAdapter,
  value: PickerValidDate,
  comparing: PickerValidDate,
) {
  return (
    utils.isSameDay(value, comparing) &&
    utils.format(value, 'meridiem') === utils.format(comparing, 'meridiem')
  );
}
