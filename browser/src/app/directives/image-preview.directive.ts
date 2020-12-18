import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  SimpleChanges
} from '@angular/core';


@Directive({ selector: 'img[imgPreview]' })
export class ImagePreviewDirective {

  @Input() image: any;
  @Input() emitOnlyFirstChange: boolean = false;
  @Output() processDone: EventEmitter<boolean> = new EventEmitter<boolean>();
  private maxHeight: number = 300;
  private maxWidth: number = 300;


  constructor(private el: ElementRef, private renderer: Renderer2,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    let reader = new FileReader();
    let el = this.el;
    let img = new Image();
    reader.onloadend = (e) => {
      img.src = reader.result as string;
      let canvas = this.renderer.createElement("canvas");
      let ctx = canvas.getContext("2d");
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > this.maxWidth) {
            height *= this.maxWidth / width;
            width = this.maxWidth;
          }
        } else {
          if (height > this.maxHeight) {
            width *= this.maxHeight / height;
            height = this.maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctr = canvas.getContext("2d");
        ctr.drawImage(img, 0, 0, width, height);
        el.nativeElement.src = canvas.toDataURL("image/jpg");

        if (this.emitOnlyFirstChange) {
          if (changes.image.isFirstChange()) {
            this.processDone.emit(true);
          }
        } else {
          this.processDone.emit(true);
        }


      };
    };

    if (this.image) {
      return reader.readAsDataURL(this.image);
    }

  }

}
