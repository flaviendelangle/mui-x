import { CalendarEvent } from '../../models/events';
import { CalendarResource } from '../../models/resource';

// TODO: Add support for props.color
export function getColorClassName(parameters: GetColorClassNameParameters): string {
  const { event, resource } = parameters;
  const color = event?.color ?? resource?.color ?? 'primary';

  return `palette-${color}`;
}

interface GetColorClassNameParameters {
  event: CalendarEvent | undefined;
  resource: CalendarResource | undefined;
}
