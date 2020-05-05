import { Component, ElementRef, ViewChild } from '@angular/core';
import { ScrollHolderService } from '../util/scroll-holder.service';

@Component({
  selector: 'client-app-layout',
  template: `
    <layout-header></layout-header>
    <div class="scroll-holder" #scrollHolder>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['layout.component.scss']
})
export class LayoutComponent {
  @ViewChild('scrollHolder', {static: true}) scrollHolder: ElementRef;

  constructor(private scrollHolderService: ScrollHolderService) {

  }

  ngOnInit(): void {
    this.scrollHolderService.scrollHolder = this.scrollHolder.nativeElement;
  }
}
