import { Component } from '@angular/core';
import { format, getDaysInMonth, lastDayOfMonth, startOfMonth } from 'date-fns';
import { Subject } from 'rxjs';

interface DatePickerMonth {
  previousMonth: Array<number>;
  nextMonth: Array<number>;
  days: Array<any>;
  month: string;
  year: string;
  current: number;
  disabledFromDay: number;
  disabledToDay: number;
}

@Component({
  selector: 'cv-date-picker-dropdown',
  templateUrl: './cv-date-picker-dropdown.html',
  styleUrls: ['./cv-date-picker-dropdown.scss']
})
export class CvDatePickerDropdownComponent {
  month: DatePickerMonth;
  weekLabels: Array<string> = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
  nextMonthDisabled: boolean;
  prevMonthDisabled: boolean;
  nextYearDisabled: boolean;
  prevYearDisabled: boolean;
  format: string = 'YYYY-MMMM-D';
  maxDate: string = '';
  minDate: string = '';
  currentMonth: string = '';
  $select: Subject<string> = new Subject<string>();
  private sundayLabel: string = 'Sun';
  private currentDate: Date;
  private monthDate: Date;
  private _weekStart: string | 'monday' | 'sunday' = 'sunday';
  private _date: string;
  private weekDaysCount: number = 7;

  constructor() {
  }

  get weekStart(): string {
    return this._weekStart;
  }

  set weekStart(value) {
    this._weekStart = value;
  }

  get date(): string {
    return this._date;
  }

  set date(value: string) {
    this._date = value;
  }

  select(day: number): void {
    const [year, month] = [...this.getDateMD(this.monthDate)];
    const selectedDate: string = format(`${year}-${("0" + month.toString()).slice(-2)}-${("0" + day.toString()).slice(-2)}`, this.format);
    this.$select.next(selectedDate);
  }

  onNextYear(step: number): void {
    if (!this.nextMonthDisabled) {
      let [year, month] = [...this.getDateMD(this.monthDate)];
      if (!this.maxDate) {
        year += step;
      } else {
        const [maxYear, maxMonth] = [...this.getDateMD(this.maxDate)];
        year += step;
        if (year >= maxYear) {
          year = maxYear;
        }
        if (month >= maxMonth) {
          month = maxMonth;
        }
      }
      this.monthDate = new Date(`${year}-${("0"+month.toString()).slice(-2)}-01`);
      this.month = this.generateMonth(this.monthDate);
      this.checkMinMaxDate(year, month);
    }
  }

  onPrevYear(step: number): void {
    if (!this.prevYearDisabled) {
      let [year, month] = [...this.getDateMD(this.monthDate)];
      if (!this.minDate) {
        if (year <= 0) {
          year = 0;
        } else {
          year -= step;
        }
      } else {
        const [minDate, minMonth] = [...this.getDateMD(this.minDate)];
        year -= step;
        if (year <= minDate) {
          year = minDate;
        }
        if (month <= minMonth) {
          month = minMonth;
        }
      }
      this.monthDate = new Date(`${year}-${("0" + month.toString()).slice(-2)}-01`);
      this.month = this.generateMonth(this.monthDate);
      this.checkMinMaxDate(year, month);
    }
  }

  onNextMonth(event: Event): void {
    if (!this.nextMonthDisabled) {
      let [year, month] = [...this.getDateMD(this.monthDate)];
      if (month == 12) {
        year += 1;
        month = 1;
      } else {
        month += 1;
      }
      this.monthDate = new Date(`${year}-${("0" + month.toString()).slice(-2)}-01`);
      this.month = this.generateMonth(this.monthDate);
      this.checkMinMaxDate(year, month);
    }
  }

  onPrevMonth(event: Event): void {
    if (!this.prevMonthDisabled) {
      let [year, month] = [...this.getDateMD(this.monthDate)];
      if (month == 1) {
        year -= 1;
        month = 12;
      } else {
        month -= 1;
      }
      this.monthDate = new Date(`${year}-${("0" + month.toString()).slice(-2)}-01`);
      this.month = this.generateMonth(this.monthDate);
      this.checkMinMaxDate(year, month);
    }
  }

  init(): void {
    if (!this.date) {
      this.currentDate = this.monthDate = new Date();
    } else {
      const date = new Date(this.date);
      if (!isNaN(date.getTime())) {
        this.currentDate = this.monthDate = date;
      } else {
        this.currentDate = this.monthDate = new Date();
      }
    }

    this.currentMonth = format(this.currentDate, 'MMMM');
    this.month = this.generateMonth(this.currentDate);
    this.weekStart == 'monday' ? this.weekLabels.push(this.sundayLabel) : this.weekLabels.unshift(this.sundayLabel);
    let [year, month] = [...this.getDateMD(this.monthDate)];
    this.checkMinMaxDate(year, month);
  }

  private checkMinMaxDate(year: number, month: number): void {
    if (this.maxDate) {
      const [maxYear, maxMonth] = [...this.getDateMD(this.maxDate)];
      this.nextMonthDisabled = year >= maxYear && maxMonth == month;
      this.nextYearDisabled = year >= maxYear;
    }
    if (this.minDate) {
      const [minYear, minMonth] = [...this.getDateMD(this.minDate)];
      this.prevMonthDisabled = minYear >= year && minMonth == month;
      this.prevYearDisabled = minYear >= year;
    }
  }

  /**
   * Get Date Year, Date
   * @returns  {[year, month]}
   */
  private getDateMD(date: Date | string): Array<any> {
    return format(date, 'YYYY MM D').split(' ').map(Number);
  }

  /**
   * Week offset for empty blocks in calendar
   * @param {number} weekDay
   * @returns {number}
   */
  private getWeekOffset(weekDay: number): number {
    const weekOffset = this._weekStart === 'monday' ? weekDay - 1 : weekDay;

    return Math.abs(weekOffset);
  }

  private getLastWeekOffset(weekDay: number): number {
    return this.weekStart === 'monday' ? weekDay : weekDay + 1;
  }

  private generateMonth(date: Date): DatePickerMonth {
    const previousMothDate = new Date(date.getTime()); //copy
    previousMothDate.setMonth(previousMothDate.getMonth() - 1);
    const previousMothLastDay = parseInt(format(lastDayOfMonth(previousMothDate), 'D'));
    const monthDaysCount = getDaysInMonth(date);
    const startWeekDay = startOfMonth(date);
    const startWeekDayIndex = parseInt(format(startWeekDay, 'd'));
    const lastWeekDayIndex = parseInt(format(lastDayOfMonth(date), 'd'));
    const daysArray = Array(monthDaysCount).fill(0).map((x, i) => i + 1);
    const monthDayOffsetCount = this.getWeekOffset(startWeekDayIndex);
    const weekDayOffset = new Array(monthDayOffsetCount);
    const currentDay: number = format(this.currentDate, 'YYYY MM') == format(date, 'YYYY MM') ? parseInt(format(this.currentDate, 'D')) : 0;
    const nextMothDays = Array(this.weekDaysCount - this.getLastWeekOffset(lastWeekDayIndex)).fill(0).map((x, i) => i + 1);
    const previousMonthDays= Array(monthDayOffsetCount).fill(previousMothLastDay - monthDayOffsetCount).map((x, i) =>  x + 1 + i);

    return {
      previousMonth: previousMonthDays,
      nextMonth: nextMothDays,
      days: daysArray,
      month: format(date, 'MMMM'),
      year: format(date, 'YYYY'),
      disabledFromDay: this.getDisabledDayFrom(date),
      disabledToDay: this.getDisabledDayTo(date),
      current: currentDay
    };
  }

  private getDisabledDayTo(date: Date): number {
    if (!this.maxDate) {
      return 0;
    }
    const [year, month] = format(date, 'YYYY MM').split(' ').map(Number);
    const [maxYear, maxMonth, maxDay] = [...this.getDateMD(this.maxDate)];
    if (year >= maxYear && month >= maxMonth) {
      return maxDay;
    }
  }

  private getDisabledDayFrom(date): number {
    if (!this.minDate) {
      return 0;
    }
    const [year, month] = format(date, 'YYYY MM').split(' ').map(Number);
    const [minYear, minMonth, minDay] = [...this.getDateMD(this.minDate)];
    if (year <= minYear && month <= minMonth) {
      return minDay;
    }
  }

}
