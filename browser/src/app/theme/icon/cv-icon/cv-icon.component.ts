import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cv-icon',
  template: ``,
  styleUrls: ['./cv-icon.component.scss'],
})
export class CvIconComponent implements OnInit {

  @Input() icon: string;
  @Input() color: string;
  @Input() size: number;

  @HostBinding('style.color') iconColor: string = '#fff';
  @HostBinding('class') iconClass = '';
  @HostBinding('style.font-size.px') iconSize;

  constructor() {
  }

  ngOnInit(): void {
    this.iconClass = this.icon;
    this.iconColor = this.color;
    this.iconSize = this.size;
  }
}
