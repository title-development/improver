import {
  Component,
  ElementRef,
  EventEmitter, forwardRef,
  Input,
  OnInit,
  Output,
  Provider,
  Renderer2,
  ViewChild
} from '@angular/core';
import { Role } from '../../../../model/security-model';

import Cropper from 'cropperjs/dist/cropper.esm.js';
import { FILE_MIME_TYPES, FILE_SIZE_MAX } from '../../../../util/file-parameters';
import { ConfirmationService } from 'primeng/api';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { addClass } from '../../../../util/dom';
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";

export const IMAGE_CROPPER_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ImageCropperComponent),
  multi: true
};


@Component({
  selector: 'image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  host: {
    'class': 'image-cropper',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly'
  },
  providers: [
    IMAGE_CROPPER_VALUE_ACCESSOR
  ]
})
export class ImageCropperComponent implements ControlValueAccessor, OnInit {

  @Input() image: string;
  @Input() previewSize: number = 120;
  @Input() disabled: boolean = false;
  @Input() readonly : boolean = false;
  @Input() circularPreview: boolean = true;
  @Input() minCropBoxHeight: number = 100;
  @Input() minCropBoxWidth: number = 100;
  @Input() confirmTitle: string = 'Delete image';
  @Output() fileChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('cropperjs') cropperContainer;

  visible: boolean = false;
  properties: any;
  object: any;
  onConfirm: EventEmitter<any>;
  cropperIsInit: boolean = false;
  imageToLoad: any;
  Role = Role;
  imageLoading: boolean = true;
  processing: boolean = false;
  originalImage: string;
  title: string = 'Account photo';
  private cropper: any;
  private cropperSettings = {
    aspectRatio: 1,
    minCropBoxHeight: this.minCropBoxHeight,
    minCropBoxWidth: this.minCropBoxWidth
  };

  hash: number;

  constructor(private renderer: Renderer2,
              private confirmationService: ConfirmationService,
              private popUpService: PopUpMessageService) {
    this.hash = Math.floor(1000 + Math.random() * 9000);
  }

  submitPhoto(): void {
    this.processing = true;
    this.image = this.cropper.getCroppedCanvas({width: 100, height: 100}).toDataURL('image/png', 0.7);
    this.onChange(this.image);
    this.fileChange.emit(this.image);
    this.closeCrop();
    this.close();
    this.processing = false;
  }

  imageEvent(): void {
    this.imageLoading = false;
  }

  fileChangeListener($event): void {
    const file: File = $event.target.files[0];
    if (file && this.fileValidation(file)) {
      if (this.cropperIsInit) {
        this.cropperContainer.nativeElement.src = URL.createObjectURL(file);
        if (this.cropper) {
          this.cropper.destroy();
        }
        this.cropper = new Cropper(this.cropperContainer.nativeElement, this.cropperSettings);
      } else {
        this.initCropper(URL.createObjectURL(file));
      }
    }
  }

  fileValidation(file: File): boolean {
    const allowedMimeType: Array<string> = FILE_MIME_TYPES.images;
    const maxFileSize: number = FILE_SIZE_MAX.bytes;
    let errorMessage: string;
    if (!allowedMimeType.includes(file.type)) {
      errorMessage = `The file type of ${file.name} is not allowed. \r\n You can only upload the following file types: .png, .jpg, .bmp.`;
      this.popUpService.showError(errorMessage);

      return false;
    } else if (file.size > maxFileSize) {
      errorMessage = `The file ${file.name} has failed to upload. Maximum upload file size ${FILE_SIZE_MAX.megabytes} Mb.`;
      this.popUpService.showError(errorMessage);

      return false;
    } else {
      return true;
    }
  }

  closeCrop(): void {
    this.imageToLoad = {};
  }

  hideDialog(): void {
    if(this.cropper) {
      this.cropper.destroy();
    }
    this.cropperIsInit = false;
    this.cropperContainer.nativeElement.src = null;
  }

  close() {
    this.visible = false;
  }

  openCropperDialog() {
    this.visible = true;
  }

  ngOnInit(): void {
  }

  removeImage(event: Event): void {
    this.confirmationService.confirm({
      header: this.confirmTitle,
      message: `Do you want to delete the icon?`,
      accept: () => {
        this.delete.emit();
        this.image = null;
        this.onChange('')
      }
    });
  }

  writeValue(model: any): void {
    this.image = model;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private initCropper(src: string): void {
    if (!this.cropperIsInit) {
      this.cropperIsInit = true;
      this.cropperContainer.nativeElement.src = src;
      this.cropper = new Cropper(this.cropperContainer.nativeElement, this.cropperSettings);
      if(this.circularPreview) {
        setTimeout(()=> {
          addClass(this.cropper.cropBox, '-circular');
        },100)
      }
    }
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };


}
