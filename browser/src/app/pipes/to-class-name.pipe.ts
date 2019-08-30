import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toclassname'})
export class ToClassNamePipe implements PipeTransform {
  transform(value: string): any {
    if (!value) return value;

    return value.replace("_", "-").toLowerCase()

  }
}
