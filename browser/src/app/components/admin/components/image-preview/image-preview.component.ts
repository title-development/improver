import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnDestroy,
	Output,
	Renderer2,
	ViewChild
} from '@angular/core';
import { ALLOWED_FILE_EXTENTIONS, MAX_FILE_SIZE } from '../../../../util/file-parameters';
import { ConfirmationService } from 'primeng';
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { DragulaService } from "ng2-dragula";
import { Subject } from "rxjs";

let index: number = 0;

@Component({
  selector: 'image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})
export class ImagePreviewComponent implements OnDestroy, AfterViewInit {

  @Input() images: Array<string> = [];
  @Input() maxImagesNumber = 1;
  @Input() previewSize: number = 120;
  @Input() disabled: boolean = false;
  @Input() confirmTitle: string = 'Delete image';
  @Output() fileChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortedImageUrls: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('file') fileInput: ElementRef;

	private readonly destroyed$ = new Subject<void>();
  mainImageSize = this.previewSize + 30;
  index = index++;
  imageIndex: number;
  hash: number;

  constructor(private popUpService: PopUpMessageService,
              private renderer: Renderer2,
              private confirmationService: ConfirmationService,
              public changeDetectorRef: ChangeDetectorRef,
              private dragulaService: DragulaService,
              @Inject('Window') private window: Window,) {
    this.hash = Math.floor(1000 + Math.random() * 9000);

    this.dragulaService.createGroup('images-drag-group', {
      direction: 'horizontal'
    });
  }

  setTargetIndex(index: number){
    this.imageIndex = index;
  }

  onFileChange(event): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (this.validateFile(file)) {
        let imageIndex = this.imageIndex >= 0? this.imageIndex: this.images.length + 1;
        this.fileChange.emit({index: imageIndex, file: file});
        this.readImage(file, imageIndex);
        this.imageIndex = undefined;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  readImage(file, index: number) {
    let reader = new FileReader();
    let img = new Image();
    let resized = new Image();
    const size = this.previewSize * 2;

    reader.onloadend = (e) => {
      img.src = reader.result as string;
      let canvas = this.renderer.createElement('canvas');
      let resizeCanvas = this.renderer.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let resizeCtx = canvas.getContext('2d');
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        canvas = this.resize(canvas, img, size);
        resizeCanvas = this.resize(resizeCanvas, img, 1920);
        let ctr = canvas.getContext('2d');
        let rtr = resizeCanvas.getContext('2d');
        ctr.drawImage(img, 0, 0, canvas.width, canvas.height);
        rtr.drawImage(img, 0, 0, resizeCanvas.width, resizeCanvas.height);

        resizeCanvas.toBlob(blob => {
          this.fileChange.emit({index: index, file: new File([blob], file.name, {type: 'image/jpeg', lastModified: Date.now()}), lastChange: true });
        }, 'image/jpeg', 0.7);
        if (this.maxImagesNumber == 1) {
          this.images = [canvas.toDataURL('image/jpeg', 0.7)];
        } else {
          this.images.splice(index, 1, canvas.toDataURL('image/jpeg', 0.7));
          this.changeDetectorRef.detectChanges();
        }
      };
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  removeImage(event): void {
    this.confirmationService.confirm({
      header: this.confirmTitle,
      message: `Do you want to delete image?`,
      accept: () => {
        if (this.maxImagesNumber == 1) {
          this.fileChange.emit({index: null, file: null});
          this.images = [];
        }
        this.fileInput.nativeElement.value = '';
        this.delete.emit(event);
      }
    });
  }

  validateFile(file): boolean {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FILE_EXTENTIONS.includes(ext)) {
      this.popUpService.showError(`The file type of <b>${file.name}</b> is not allowed`);
      this.fileInput.nativeElement.value = '';

      return false;
    }
    if (file.size > MAX_FILE_SIZE.bytes) {
      this.popUpService.showError(`The file <b>${file.name}</b> has failed to upload. Maximum upload file size <b>${MAX_FILE_SIZE.megabytes}</b> Mb`);
      this.fileInput.nativeElement.value = '';

      return false;
    }

    return true;
  }

  private resize(canvas, img, size) {
    let width = img.width;
    let height = img.height;
    if (width > height) {
      if (width > size) {
        height *= size / width;
        width = size;
      }
    } else {
      if (height > size) {
        width *= size / height;
        height = size;
      }
    }
    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

	ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.dragulaService.destroy('images-drag-group');
  }

  ngAfterViewInit(): void {
    this.images.forEach( image => {
      if (this.images.length == 1 && image == null) {
        this.images = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

}
