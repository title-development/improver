import {Pipe, PipeTransform} from '@angular/core';
import * as decamelize from 'decamelize';


@Pipe({name: 'camelCaseToHuman'})
export class CamelCaseHumanPipe implements PipeTransform {
  transform(value: string, capitalize: boolean): string {

    if (typeof(value) !== "string") {
      return value;
    }

    let result = decamelize(value, ' ');

    if (capitalize) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;

  }
}
