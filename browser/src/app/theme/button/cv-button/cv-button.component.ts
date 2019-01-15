import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Button } from '../button';

@Component({
  selector: 'button[cv-button], a[cv-button], label[cv-button], cv-button',
  templateUrl: './cv-button.component.html',
  styleUrls: [ '../buttons-style.scss', './cv-button.component.scss' ],
  host: { 'class': 'cv-button' }
})
export class CvButtonComponent extends Button {

  constructor(el: ElementRef, renderer: Renderer2) {
    super(el, renderer);
  }

}
