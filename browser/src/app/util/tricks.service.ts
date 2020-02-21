import { EventEmitter, Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class TricksService {

  getEmptyArray(size) {
    return new Array(size);
  }

  enumToJson(enumeration: any, valueName: string = 'value', labelName: string = 'label') {

    let array = [];

    for (let item in enumeration) {
      let obj = {};
      obj[valueName] = item;
      obj[labelName] = enumeration[item];
      if (typeof enumeration[item] !== 'function') {
        array.push(obj);
      }

    }

    return array;

  }

  fillArrayWithNumbers(start: number, end: number, reverse: boolean = false) {
    let foo = [];

    for (let i = reverse ? start : end; (reverse ? i <= end : i >= start); (reverse ? i++ : i--)) {
      foo.push(i);
    }

    return foo;
  }

  replaceSpases(val: String) {
    return val.replace(' ', '');
  }

}

export function enumToArrayList(enumeration): Array<string> {
  return Object.values(enumeration)
    .filter(item => typeof item != 'function')
    .map(item => item.toString());
}

export function filtersToParams(filters): any {
  let params = {};
  Object.keys(filters).forEach(key => {
    let filterObject = filters[key];
    let value = filterObject.value;
    if (filterObject.matchMode == 'range') {
      params[key + 'From'] = value[0];
      params[key + 'To'] = value[1];
    } else if (filterObject.matchMode == 'dateRange') {
      if (value[0] && value[1]) {
        params[key + 'From'] = moment(value[0]).format("YYYY-MM-DD") + "T00:00:00";
        params[key + 'To'] = moment(value[1]).format("YYYY-MM-DD") + "T23:59:59";
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}

