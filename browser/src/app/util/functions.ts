import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { httpStatusCodeResponses } from './text-messages';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { RestPage } from '../api/models/RestPage';
import * as moment from 'moment';

/**
 Works only for new angular httpClient
 */
export function getErrorMessage(err: HttpErrorResponse | any): string {
  let error;
  try {
    error = JSON.parse(err.error).message;
  } catch (e) {
    if (err.error != null && typeof err.error == 'object') {
      error =  err.error.message && err.error.message !== '' ? err.error.message : httpStatusCodeResponses[err.status];
    } else {
      error = err.error && err.error !== '' ? err.error : httpStatusCodeResponses[err.status];
    }
    return error ? error : httpStatusCodeResponses[0]
  }
  return error;
}

export function markAsTouched(group: FormGroup | FormArray): void {
  group.markAsTouched();
  for (const i in group.controls) {
    if (group.controls[i] instanceof FormControl) {
      group.controls[i].markAsTouched();
    } else {
      markAsTouched(group.controls[i]);
    }
  }
}

export function dataURItoBlob(dataURI): Blob {
  let binary = atob(dataURI.split(',')[1]);
  let array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

export function jsonParse<T>(string: string): string | T {
  try {
    return JSON.parse(string);
  } catch (e) {
    return string;
  }
}

/**
 * @target empty object
 * @sources
 *  {
 *    param1: value1,
 *    param2: {
 *      param3: value3
 *    }
 *  }
 * @return
 *  {
 *   param1: value1,
 *   param3: value3
 *  }
 */
export function extractObjectValues(target, sources): any {
  for (const key in sources) {
    if (typeof sources[key] != 'object') {
      target[key] = sources[key];
    } else {
      extractObjectValues(target, sources[key]);
    }
  }

  return target;
}

/**
 * space case => space_case
 * @param {string} string
 * @return {string}
 */
export function toSnakeCase(string: string): string {

  return string.trim().replace(/\s/g, '_');
}

export function stringToCompare(str: number | string): string {
  return str.toString().toLowerCase().trim();
}

/**
 * return false if url path contains login word
 * @param {string} path
 * @returns {boolean}
 */
export function notLoginPage(path: string): boolean {
  let regex = /\/login/;

  return !regex.test(path);
}

export function toHttpParams(object: any): HttpParams {
  let httpParams = new HttpParams();
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value != 'function') {
      if (value instanceof Array) {
        const string = value.join();
        if (value.length > 0) {
          httpParams = httpParams.set(key, string);
        }
      } else if (typeof value == 'object') {
        const string = JSON.stringify(value);
        if (string.length > 0) {
          httpParams = httpParams.set(key, string);
        }
      } else {
        if ((value as any).toString().length > 0) {
          httpParams = httpParams.set(key, (value as any).toString());
        }
      }
    }
  });

  return httpParams;
}

export function setHttp(url: string): string {
  if (url && url.search(/^http[s]?\:\/\//) == -1) {
    url = 'http://' + url;
  }

  return url;
}

export function enumToJson(enumeration: any, valueName: string = 'value', labelName: string = 'label') {
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

export function reCalculatePageable(oldPageable: RestPage<any>,
                                       newPageable: RestPage<any>,
                                       maxItemPerPage: number): RestPage<any> {
  const items = newPageable.totalElements;
  const pages = Math.ceil(items / maxItemPerPage);
  const page = oldPageable.number > pages ? pages : oldPageable.number;
  oldPageable.numberOfElements = newPageable.numberOfElements;
  oldPageable.totalPages = pages;
  oldPageable.last = newPageable.last;
  oldPageable.number = page;
  oldPageable.content = newPageable.content;
  return oldPageable;
}

export function getKeyFromEnum(enumeration, value) {
  return Object.keys(enumeration).filter(key =>
    enumeration[key] === value
  )[0];
}

export function resizeImage(img, width: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = canvas.width * (img.height / img.width);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

export function capitalize(string: string): string {
  let [s, ...tring] = (string.toLowerCase() as any);
  return [s.toUpperCase(), ...tring].join('');
}

export function chunk<T>(array: ReadonlyArray<T>, size: number): T[][] {
  const chunked: T[][] = [];
  let index = 0;
  while (index < array.length) {
    chunked.push(array.slice(index, size + index));
    index += size;
  }
  return chunked;
}

export function clone(src) {
  return JSON.parse(JSON.stringify(src));
}

export function removePhoneMask(s: string) {
  return s.replace(/-/g, "");
}

export function applyPhoneMask(value): any {
  value = value.toString().replace(/\D/g, '');
  if (value.length == 0) {
    return '';
  } else if (value.length <= 3) {
    return value.replace(/^(\d{0,3})/, '$1');
  } else if (value.length <= 6) {
    return value.replace(/^(\d{0,3})(\d{0,3})/, '$1-$2');
  } else if (value.length <= 10) {
    return value.replace(/^(\d{0,3})(\d{0,3})(.*)/, '$1-$2-$3');
  } else {
    return this.lastValue;
  }
}

export function removeDuplicatesFromArray(array, uniqueFieldName, skipFilterFn?) {
  let splitted = [];
  if (skipFilterFn) {
    splitted = array
      .reduce((result, el) => {
        result[skipFilterFn(el) ? 1 : 0].push(el);
        return result;
      }, [[], []]);
  }

  let filteredArray = skipFilterFn ? splitted[0] : array;
  let unfilteredArray = skipFilterFn ? splitted[1] : [];

  let result = filteredArray.map(e => e[uniqueFieldName])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => filteredArray[e])
    .map(e => filteredArray[e]);

  result.push(...unfilteredArray)
  return result
}

export function ngPrimeFiltersToParams(filters): any {
  const FROM = "From"
  const TO = "To"
  const DATE_FORMAT = "YYYY-MM-DD";
  const FIRST_DAY_SECOND = "00:00:00"
  const LAST_DAY_SECOND = "23:59:59"
  let params = {};
  Object.keys(filters).forEach(key => {
    let filterObject = filters[key];
    let value = filterObject.value;
    if (filterObject.matchMode == 'range') {
      params[key + FROM] = value[0];
      params[key + TO] = value[1];
    } else if (filterObject.matchMode == 'rangeMoney') {
      params[key + FROM] = value[0] * 100;
      params[key + TO] = value[1] * 100;
    } else if (filterObject.matchMode == 'dateTimeRange') {
      if (value[0] && value[1]) {
        params[key + FROM] = moment(value[0]).format(DATE_FORMAT) + "T" + FIRST_DAY_SECOND;
        params[key + TO] = moment(value[1]).format(DATE_FORMAT) + "T" + LAST_DAY_SECOND;
      }
    } else if (filterObject.matchMode == 'zonedDateTimeRange') {
      if (value[0] && value[1]) {
        console.log(moment(value[0]).format('Z'))
        console.log(moment(value[0]).format('ZZ'))
        params[key + FROM] = moment(value[0]).format(DATE_FORMAT) + "T" + FIRST_DAY_SECOND + moment(value[0]).format('Z');
        params[key + TO] = moment(value[1]).format(DATE_FORMAT) + "T" + LAST_DAY_SECOND + moment(value[1]).format('Z');
      }
    } else if (filterObject.matchMode == 'dateRange') {
      if (value[0] && value[1]) {
        params[key + FROM] = moment(value[0]).format(DATE_FORMAT);
        params[key + TO] = moment(value[1]).format(DATE_FORMAT);
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}
