import { EventEmitter, Injectable } from '@angular/core';

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
    params[key] = filters[key].value;
  });
  return params;
}

