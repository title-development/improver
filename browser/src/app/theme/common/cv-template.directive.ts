import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[cvTemplate]',
  host: {}
})
export class CvTemplate {

  @Input() type: string;

  @Input('cvTemplate') name: string;

  constructor(public template: TemplateRef<any>) {
  }

  getType(): string {
    return this.name;
  }
}
