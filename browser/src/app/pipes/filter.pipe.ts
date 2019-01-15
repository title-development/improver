import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})

export class FilterByPipe implements PipeTransform {

  private filterByString(filter) {
    filter = filter.toLowerCase();
    const regExp: RegExp = new RegExp(`\\b${filter}`, 'gmi');

    return value => {
      return regExp.test(value);
    };
  }

  private filterByObject(filter) {
    return value => {
      for (let key in filter) {
        if (!value.hasOwnProperty(key)) {
          return false;
        }

        const type = typeof value[key];
        let isMatching;

        switch (type) {
          case 'string':
            isMatching = this.filterByString(filter[key])(value[key]);
            break;

          case 'object':
            isMatching = this.filterByObject(filter[key])(value[key]);
            break;

          default:
            isMatching = this.filterDefault(filter[key])(value[key]);
        }

        if (isMatching) {
          return true;
        }
      }

      return false;
    };
  }

  /**
   * Defatul filterDefault function
   *
   * @param filter
   * @returns {(value:any)=>boolean}
   */
  private filterDefault(filter) {
    return value => {
      return !filter || filter == value;
    };
  }

  private isNumber(value) {
    return !isNaN(parseInt(value, 10)) && isFinite(value);
  }

  transform(array: any[], filter: any): any {
    const type = typeof filter;

    if (type === 'string') {
      if (this.isNumber(filter)) {
        return array.filter(this.filterDefault(filter));
      }

      return array.filter(this.filterByString(filter));
    }

    if (type === 'object') {
      return array.filter(this.filterByObject(filter));
    }

    return array.filter(this.filterDefault(filter));
  }
}
