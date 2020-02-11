import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'statuscapitalize'})
export class StatusCapitalize implements PipeTransform {
  transform(value: string, args?: string[]): any {
    return value.replace(/_/g,' ');
  }
}
