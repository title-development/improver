import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScrollHolderService } from '../../../util/scroll-holder.service';

@Component({
  selector: 'admin-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  toggleSidebar: boolean = true;
  @ViewChild('scrollHolder', {static: true}) scrollHolder: ElementRef;

  constructor(private scrollHolderService: ScrollHolderService) {

  }

  ngOnInit(): void {
    this.scrollHolderService.scrollHolder = this.scrollHolder.nativeElement;
  }
}
