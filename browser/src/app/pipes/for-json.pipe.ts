import { Pipe, PipeTransform } from "@angular/core";

/**
 * @deprecated Not safe because not keep same ordering in array as was in input json
 */
@Pipe({name: 'forjson'})
export class ForJsonPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let items = [];
    for (let key in value) {
      items.push({key: key, value: value[key]});
    }
    return items;
  }
}
