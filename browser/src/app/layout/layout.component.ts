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
  styles: [`
    :host {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .scroll-holder {
      flex-grow: 1;
      overflow-y: auto;
      /*height: 100%;*/
    }

    router-outlet ::ng-deep + * {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 50px);
    }

    router-outlet ::ng-deep + * > .container {
      flex-grow: 1;
    }
  `]
})
export class LayoutComponent {
  @ViewChild('scrollHolder') scrollHolder: ElementRef;

  constructor(private scrollHolderService: ScrollHolderService) {

  }

  ngOnInit(): void {
    this.scrollHolderService.scrollHolder = this.scrollHolder.nativeElement;
  }
}
