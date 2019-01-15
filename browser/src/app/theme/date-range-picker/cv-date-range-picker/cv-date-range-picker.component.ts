import { ChangeDetectionStrategy, Component, forwardRef, Input, Optional, Provider, SkipSelf } from '@angular/core';
import { format, getDaysInMonth, getTime, isAfter, isBefore, lastDayOfMonth, startOfMonth } from 'date-fns';
import { CvDatePickerComponent } from '../../date-picker/cv-date-picker/cv-date-picker';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm } from '@angular/forms';

export const DATE_RANGE_PICKER_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvDateRangePickerComponent),
  multi: true
};

interface MinMaxConf {
  date: Date,
  day: number;
  month: number,
  year: number
}

interface Month {
  previousMonthDays: Array<number>;
  nextMonthDays: Array<number>;
  days: Array<number>;
  month: string;
  monthNumber: number;
  year: number;
}

interface DaterRangePicker {
  firstMoth,
  nextMonth,
  currentDay,
  currentMonth
}

class SelectionRange {
  date: Date;
  day: number;
  month: number;
  year: number;
  timestamp: number;

  of(year: number, month: number, day: number): SelectionRange {
    return this.build(year, month, day);
  }

  fromDate(date: Date): SelectionRange {
    const [year, month, day] = format(date, 'YYYY MM DD').split(' ').map(Number);
    return this.build(year, month, day);
  }

  private build(year: number, month: number, day: number): SelectionRange {
    this.date = new Date(year, month - 1, day);
    this.timestamp = getTime(this.date);
    this.day = day;
    this.month = month;
    this.year = year;
    return this;
  }
}

export class CvDateRangePicker {
  from: string;
  till: string;

  constructor(from: string, till: string) {
    this.from = from;
    this.till = till;
  }
}

@Component({
  selector: 'cv-date-range-picker',
  templateUrl: './cv-date-range-picker.component.html',
  styleUrls: ['./cv-date-range-picker.component.scss'],
  providers: [
    DATE_RANGE_PICKER_VALUE_ACCESSOR
  ],
  host: {
    'class': 'cv-date-range-picker',
    '[class.-submitted]': 'isSubmitted()',
  },
})
export class CvDateRangePickerComponent implements ControlValueAccessor {
  @Input() format: string = 'YYYY-MM-DD';
  @Input() required;
  @Input() minDate: string | Date;
  @Input() maxDate: string | Date;

  weekLabels: Array<string> = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
  currentMonth;
  month;
  monthDate: Date;
  currentDate: Date;
  model: CvDateRangePicker;
  disabled: boolean = false;
  nextDisabled: boolean = false;
  prevDisabled: boolean = false;
  minDateConf: MinMaxConf;
  maxDateConf: MinMaxConf;

  dateRangePicker: DaterRangePicker;
  startSelection: SelectionRange;
  endSelection: SelectionRange;
  private sundayLabel: string = 'Sun';
  private weekStart: string | 'monday' | 'sunday' = 'sunday';
  private weekDaysCount: number = 7;


  constructor(@Optional() @SkipSelf() private form: NgForm) {
  }

  writeValue(value: CvDateRangePicker): void {
    this.model = value;
    if (this.model) {
      const fromDate = new Date(this.model.from);
      const tillDate = new Date(this.model.till);
      if (!isNaN(fromDate.getTime()) && !isNaN(tillDate.getTime())) {
        this.monthDate = fromDate;
        this.currentDate = new Date();
        this.currentMonth = format(this.monthDate, 'MMMM');
        this.month = this.render(this.monthDate);
        this.startSelection = new SelectionRange().fromDate(fromDate);
        this.endSelection = new SelectionRange().fromDate(tillDate);
      } else {
        this.currentDate = this.monthDate = new Date();
        this.currentMonth = format(this.currentDate, 'MMMM');
        this.month = this.render(this.currentDate);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    this.currentDate = this.monthDate = new Date();
    this.currentMonth = format(this.currentDate, 'MMMM');
    this.month = this.render(this.currentDate);
    this.weekStart == 'monday' ? this.weekLabels.push(this.sundayLabel) : this.weekLabels.unshift(this.sundayLabel);
    if (this.minDate) {
      const minDate = this.minDate instanceof Date ? this.minDate : new Date(this.minDate);
      const [minYear, minMonth, minDay] = !isNaN(minDate.getTime()) ? format(minDate, 'YYYY MM DD').split(' ').map(Number) : [0, 0, 0];
      if (!isNaN(minDate.getTime())) {
        this.minDateConf = {
          date: minDate,
          day: minDay,
          month: minMonth,
          year: minYear
        };
      }
    }
    if (this.maxDate) {
      const maxDate = this.maxDate instanceof Date ? this.maxDate : new Date(this.maxDate);
      const [maxYear, maxMonth, maxDay] = !isNaN(maxDate.getTime()) ? format(maxDate, 'YYYY MM DD').split(' ').map(Number) : [0, 0, 0];
      if (!isNaN(maxDate.getTime())) {
        this.maxDateConf = {
          date: maxDate,
          day: maxDay,
          month: maxMonth,
          year: maxYear
        };
      }
    }
  }

  render(date: Date) {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const currentDay: number = format(this.currentDate, 'YYYY MM') == format(date, 'YYYY MM') ? parseInt(format(this.currentDate, 'D')) : 0;
    const currentMonth: number = format(this.currentDate, 'YYYY MM') == format(date, 'YYYY MM') ? parseInt(format(this.currentDate, 'M')) : 0;
    this.dateRangePicker = {
      firstMoth: this.generateMonth(date),
      nextMonth: this.generateMonth(nextMonth),
      currentDay: currentDay,
      currentMonth: currentMonth
    };
  }

  select(day: number, month: number, year: number): void {
    if (this.startSelection && this.endSelection) {
      this.clearSelection();
      this.startSelection = new SelectionRange().of(year, month, day);
      this.updateValueAccessor();
    } else if (!this.startSelection) {
      this.startSelection = new SelectionRange().of(year, month, day);
      this.updateValueAccessor();
    } else if (this.startSelection && !this.endSelection) {
      this.endSelection = new SelectionRange().of(year, month, day);
      this.updateValueAccessor();
    } else {
      this.clearSelection();
    }
  }

  onPrevMonth(prevent: boolean): void {
    if (prevent) {
      return;
    }
    let [year, month] = [...this.getDateMD(this.monthDate)];
    if (month == 1) {
      year -= 1;
      month = 12;
    } else {
      month -= 1;
    }
    this.monthDate = new Date(`${year}-${("0" + month.toString()).slice(-2)}-01`);
    this.month = this.render(this.monthDate);
  }

  onNextMonth(prevent: boolean): void {
    if (prevent) {
      return;
    }
    let [year, month] = [...this.getDateMD(this.monthDate)];
    if (month == 12) {
      year += 1;
      month = 1;
    } else {
      month += 1;
    }
    this.monthDate = new Date(`${year}-${("0" + month.toString()).slice(-2)}-01`);
    this.month = this.render(this.monthDate);
  }

  isSelected(day: number, month: Month): boolean {
    return this.startSelection && this.startSelection.day == day && this.startSelection.month == month.monthNumber && this.startSelection.year == month.year ||
      this.endSelection && this.endSelection.day == day && this.endSelection.month == month.monthNumber && this.endSelection.year == month.year;
  }

  isDisabled(day: number, month: Month): boolean {
    if (!this.minDate && !this.maxDate) {
      return false;
    } else {
      return isAfter(new Date(month.year, month.monthNumber - 1, day), this.maxDateConf.date) || isBefore(new Date(month.year, month.monthNumber - 1, day), this.minDateConf.date);
    }
  }

  isDisabledPrevNavigation(month: Month): boolean {
    if (this.minDateConf) {
      if (month.year < this.minDateConf.year) {
        return true;
      } else {
        return month.year <= this.minDateConf.year && month.monthNumber <= this.minDateConf.month;
      }
    } else {
      return false;
    }

  }

  isDisabledNextNavigation(month: Month): boolean {
    if (this.maxDateConf) {
      if (month.year > this.maxDateConf.year) {
        return true;
      } else {
        return month.year >= this.maxDateConf.year && month.monthNumber >= this.maxDateConf.month;
      }
    } else {
      return false;
    }

  }

  inRange(day: number, month: Month): boolean {
    if (!this.startSelection || !this.endSelection) {
      return false;
    }
    let startDate;
    let endDate;
    const currentDay = getTime(new Date(month.year, month.monthNumber - 1, day));
    if (this.startSelection.timestamp > this.endSelection.timestamp) {
      startDate = this.endSelection.timestamp;
      endDate = this.startSelection.timestamp;
    } else {
      endDate = this.endSelection.timestamp;
      startDate = this.startSelection.timestamp;
    }
    return startDate < currentDay && currentDay < endDate;
  }

  isSubmitted(): boolean {
    return this.form && this.form.submitted;
  }

  isRequired(): boolean {
    return this.required != undefined;
  }

  private generateMonth(date: Date): Month {
    const previousMothDate = new Date(date.getTime()); //copy
    previousMothDate.setMonth(previousMothDate.getMonth() - 1);
    const previousMothLastDay = parseInt(format(lastDayOfMonth(previousMothDate), 'D'));
    const monthDaysCount = getDaysInMonth(date);
    const startWeekDayIndex = parseInt(format(startOfMonth(date), 'd'));
    const lastWeekDayIndex = parseInt(format(lastDayOfMonth(date), 'd'));
    const daysArray = Array(monthDaysCount).fill(0).map((x, i) => i + 1);
    const monthDayOffsetCount = this.getStartWeekOffset(startWeekDayIndex);
    const weekDayOffset = new Array(monthDayOffsetCount);
    const nextMothDays = Array(this.weekDaysCount - this.getLastWeekOffset(lastWeekDayIndex)).fill(0).map((x, i) => i + 1);
    const previousMonthDays = Array(monthDayOffsetCount).fill(previousMothLastDay - monthDayOffsetCount).map((x, i) => x + 1 + i);

    return {
      previousMonthDays: previousMonthDays,
      nextMonthDays: nextMothDays,
      days: daysArray,
      month: format(date, 'MMMM'),
      monthNumber: parseInt(format(date, 'M')),
      year: parseInt(format(date, 'YYYY')),
    };
  }

  private getDateMD(date: Date | string): Array<any> {
    return format(date, 'YYYY MM DD').split(' ').map(Number);
  }

  private getStartWeekOffset(weekDay: number): number {
    const weekOffset = this.weekStart === 'monday' ? weekDay - 1 : weekDay;

    return Math.abs(weekOffset);
  }

  private getLastWeekOffset(weekDay: number): number {
    return this.weekStart === 'monday' ? weekDay : weekDay + 1;
  }

  private clearSelection(): void {
    this.endSelection = this.startSelection = null;
  }

  private updateValueAccessor(): void {
    let start = this.startSelection;
    let end = this.endSelection;
    if(this.startSelection && !this.endSelection) {
      const data = new CvDateRangePicker(format(this.startSelection.date, this.format), format(this.startSelection.date, this.format));
      this.onChange(data);
    } else {
      if (this.startSelection.timestamp > this.endSelection.timestamp) {
        this.startSelection = end;
        this.endSelection = start;
      }
      const data = new CvDateRangePicker(format(this.startSelection.date, this.format), format(this.endSelection.date, this.format));
      this.onChange(data);
    }
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}
