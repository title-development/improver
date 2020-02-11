import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'statustostring'})
export class StatusToString implements PipeTransform {
  transform(value: string, args?: string[]): any {
    value = value.replace(/_/g,' ').toLowerCase();
    value = value.charAt(0).toUpperCase() + value.slice(1);
    return value;
  }
}
