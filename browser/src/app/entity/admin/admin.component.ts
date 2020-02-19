import { Component, ViewEncapsulation } from '@angular/core';
import { Message } from 'primeng';

@Component({
  selector: 'admin-panel',
  template: `<router-outlet></router-outlet><p-confirmDialog width="425"></p-confirmDialog>`,
  styleUrls: [
    '../../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css',
    '../../../../node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    '../../../../node_modules/@fortawesome/fontawesome-free/css/v4-shims.min.css',
    '../../../../node_modules/primeicons/primeicons.css',
    '../../../../node_modules/primeng/resources/themes/nova-light/theme.css',
    '../../../../node_modules/primeng/resources/primeng.min.css',
    './primeng.scss',
    './admin.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent {
  constructor() {
  }
}
