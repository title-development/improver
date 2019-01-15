import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Button } from '../button';

@Component({
  selector: 'button[cv-button-flat], a[cv-button-flat], label[cv-button-flat], cv-button-flat',
  templateUrl: './cv-button-flat.component.html',
  styleUrls: [ '../buttons-style.scss', './cv-button-flat.component.scss' ],
  host: {
    'class': 'cv-button-flat'
  }
})
export class CvButtonFlatComponent extends Button {
  constructor(el: ElementRef, renderer: Renderer2) {
    super(el, renderer);
  }
}
