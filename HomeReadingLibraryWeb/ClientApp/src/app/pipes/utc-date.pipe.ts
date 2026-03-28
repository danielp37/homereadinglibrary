import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: false,
  name: 'utcDate'
})
export class UtcDatePipe implements PipeTransform {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string): any {

    if (!value) {
      return '';
    }

    const dateValue = new Date(value);

    const dateWithNoTimezone = new Date(
      dateValue.getUTCFullYear(),
      dateValue.getUTCMonth(),
      dateValue.getUTCDate(),
      dateValue.getUTCHours(),
      dateValue.getUTCMinutes(),
      dateValue.getUTCSeconds()
    );

    return dateWithNoTimezone;
  }
}
