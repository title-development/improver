import {Pipe, PipeTransform} from '@angular/core';


@Pipe({name: 'addHtml'})
export class AddHtmlPipe implements PipeTransform {
  transform(url: string): string {
    if (url && url.search(/^http[s]?\:\/\//) == -1) {
      url = 'http://' + url;
    }

    return url;
  }
}
