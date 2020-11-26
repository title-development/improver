import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import Cropper from 'cropperjs/dist/cropper.esm.js';
import { AccountService } from '../../../api/services/account.service';
import { Role } from '../../../model/security-model';
import { getErrorMessage } from '../../../util/functions';
import { FILE_MIME_TYPES, FILE_SIZE_MAX } from '../../../util/file-parameters';

@Component({
  selector: 'account-edit-photo-dialog',
  templateUrl: './account-edit-photo-dialog.component.html',
  styleUrls: ['./account-edit-photo-dialog.component.scss']
})

export class AccountEditPhotoDialogComponent implements OnInit {

  @ViewChild('cropperjs') cropperContainer;

  @Output() onPhotoReady: EventEmitter<string> = new EventEmitter<string>();

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
    minCropBoxHeight: 100,
    minCropBoxWidth: 100
  };

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public popupService: PopUpMessageService) {
  }

  ngOnInit(): void {
  }

  close(): void {
    this.currentDialogRef.close();
  }

  submitPhoto(): void {
    this.processing = true;
    this.onPhotoReady.emit(this.cropper.getCroppedCanvas({width: 100, height: 100}).toDataURL('image/png', 0.7));
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
        this.cropper.destroy();
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
      this.popupService.showError(errorMessage);

      return false;
    } else if (file.size > maxFileSize) {
      errorMessage = `The file ${file.name} has failed to upload. Maximum upload file size ${FILE_SIZE_MAX.megabytes} Mb.`;
      this.popupService.showError(errorMessage);

      return false;
    } else {
      return true;
    }
  }

  closeCrop(): void {
    this.imageToLoad = {};
  }

  rotate(deg: number): void {
    this.cropper.rotate(deg);
  }

  zoom(ratio): void {
    this.cropper.zoom(ratio);
  }

  private initCropper(src: string): void {
    if (!this.cropperIsInit) {
      this.cropperIsInit = true;
      this.cropperContainer.nativeElement.src = src;
      this.cropper = new Cropper(this.cropperContainer.nativeElement, this.cropperSettings);
    }
  }

}
