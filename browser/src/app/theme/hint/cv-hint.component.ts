import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'cv-hint-holder',
  templateUrl: './cv-hint.component.html',
  styleUrls: ['./cv-hint.component.scss'],
  host: {
    '[class.-left-glue]': 'glueLeft',
    '[class.-right-glue]': 'glueRight',
    '[class.-opened]': 'opened',
  }
})
export class CvHintComponent implements OnInit, AfterViewInit {
  glueLeft: boolean = false;
  glueRight: boolean = false;
  opened: boolean = false;
  hintTitle: string;
  private readonly PAGE_OFFSET: number = 8;
  @ViewChild('holder') holder: ElementRef;

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const holder = this.elementRef.nativeElement.getBoundingClientRect();
      this.glueLeft = holder.x - this.PAGE_OFFSET < 0;
      this.glueRight = holder.x + holder.width + this.PAGE_OFFSET > window.innerWidth;
      this.opened = true;
    }, 0)

  }
}
