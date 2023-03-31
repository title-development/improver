import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toclassname'})
export class ToClassNamePipe implements PipeTransform {
  transform(value: string): any {
    return value
      ? value.replace(/ /g, "-")
        .replace(/_/g, "-")
        .replace(/[^a-z0-9-]/gi, '')
        .toLowerCase() : value
  }
}
