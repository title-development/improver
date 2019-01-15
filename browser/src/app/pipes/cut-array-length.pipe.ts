import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cutarraylength'})
export class CutArrayLengthPipe implements PipeTransform {
  transform(value: string, args: number): any {
    return value.slice(0,args);
  }
}
