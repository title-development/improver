import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toclassname'})
export class ToClassNamePipe implements PipeTransform {
  transform(value: string): any {
    return value ? value.replace(/ /g, "-").replace(/_/g, "-").toLowerCase() : value
  }
}
