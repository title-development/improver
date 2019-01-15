import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Button } from '../button';

@Component({
  selector: 'button[cv-button-empty], a[cv-button-empty], label[cv-button-empty], cv-button-empty',
  templateUrl: './cv-button-empty.component.html',
  styleUrls: ['../buttons-style.scss', './cv-button-empty.component.scss'],
  host: {'class': 'cv-button-empty'}

})
export class CvButtonEmptyComponent extends Button {

  constructor(el: ElementRef, renderer: Renderer2) {
    super(el, renderer);
  }
}
