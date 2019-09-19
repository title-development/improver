import { Component, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, } from '@angular/core';
import { FileItem, FileLikeObject, FileUploader } from 'ng2-file-upload';
import { ProjectService } from '../../api/services/project.service';
import { FILE_MIME_TYPES, IMAGE_UPLOADER_QUERY_LIMIT, MAX_FILE_SIZE } from '../../util/file-parameters';
import { confirmDialogConfig, customerGalleryDialogConfig, } from '../dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { SystemMessageType } from '../../model/data-model';
import { HttpClient } from '@angular/common/http';
import { SecurityService } from '../../auth/security.service';


import { dialogsMap } from '../dialogs/dialogs.state';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss', './image-preview.scss']
})
export class ImagesUploaderComponent implements OnInit {

  @Input() title: string;
  @Input() subtitle: string;
  @Input() projectImages: Array<any>;
  @Input() apiUrl: string;
  @Input() isArchived: boolean;
  @Input() projectView: boolean = false;
  @Input() showActionButtons: boolean = true;
  @Output() uploadCompleted: EventEmitter<boolean> = new EventEmitter<boolean>();

  editMode: boolean;
  dropZoneTrigger: boolean;
  hasBaseDropZoneOver: boolean = false;
  uploader: FileUploader;
  customerGalleryDialogRef: MatDialogRef<any>;

  private confirmDialog: MatDialogRef<any>;
  private MAX_WIDTH: number = 1920;
  private MAX_HEIGHT: number = 1080;
  private COMPRESS_RATIO: number = 0.7;
  private refreshingAccessToken: boolean = false;

  constructor(private projectService: ProjectService,
              private renderer: Renderer2,
              public dialog: MatDialog,
              private popupService: PopUpMessageService,
              private http: HttpClient,
              private securityService: SecurityService) {
  }

  ngOnInit(): void {
    this.uploader = new FileUploader({
      url: this.apiUrl,
      authToken: this.securityService.getTokenHeader(),
      allowedMimeType: FILE_MIME_TYPES.images,
      maxFileSize: MAX_FILE_SIZE.bytes,
      queueLimit: IMAGE_UPLOADER_QUERY_LIMIT,
    });
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      this.handleError(item, filter);
    };
    this.uploader.onAfterAddingAll = (items: Array<FileItem>) => {
      this.uploader.queue.forEach((item: FileItem) => {
        this.resizeImage(item._file).subscribe((blob: Blob) => {
          item._file = (blob as File);
        });
      });
    };
    this.uploader.onProgressItem = (item: FileItem) => {
      this.checkAccessToken(item);
    };
    this.uploader.onBeforeUploadItem = (item: FileItem) => {
      this.checkAccessToken(item);
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number,) => {
      if (status == 401) {
        //resetting image to upload again
        item.isUploaded = false;
        item.isError = false;
      }
    };
  }

  @HostListener('window:keyup', ['$event'])
  onEscClicked(event: KeyboardEvent): void {
    if (event.keyCode == 27 && this.dropZoneTrigger) {
      this.closeDropZone(event);
    }
  }

  hasUnsavedImages(): boolean {
    return this.uploader.getNotUploadedItems().length > 0;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  closeDropZone(event: Event): void {
    this.dropZoneTrigger = false;
    this.uploader.clearQueue();
  }

  showDropZone(event: Event): void {
    this.dropZoneTrigger = true;
  }

  fileOverBase(event: any): void {
    this.hasBaseDropZoneOver = event;
  }

  deleteImage(event, index: number, path: string): void {
    event.preventDefault();
    event.stopPropagation();
    const properties = {
      title: 'Confirm delete action',
      message: 'Do you want to delete this image?',
      OK: 'Yes',
      CANCEL: 'No'
    };

    this.confirmDialog = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialog.componentInstance.properties = properties;
    this.confirmDialog.componentInstance.onConfirm = new EventEmitter<boolean>();
    this.confirmDialog.componentInstance.onConfirm.subscribe(res => {
      this.http.delete(this.apiUrl, {params: {'imageUrl': path}, responseType: 'text'}).subscribe(
        res => {
          this.projectImages.splice(index, 1);
          this.projectImages = this.projectImages.slice();
          this.popupService.showMessage(
            {
              text: 'Image has been deleted.',
              type: SystemMessageType.INFO,
              timeout: 5000
            }
          );
        },
        err => {
          console.log(err);
        });
    });
  }

  removeImageFromQuery(event: Event, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.uploader.queue.splice(index, 1);
  }

  rotateImage(event: Event, fileItem): void {
    event.preventDefault();
    event.stopPropagation();
    fileItem['processing'] = true;
    let reader = new FileReader();
    let img = new Image();
    if (fileItem) {
      reader.readAsDataURL(fileItem._file);
    }
    reader.onloadend = (event) => {
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = this.renderer.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = img.width;
        const height = img.height;
        canvas.height = width;
        canvas.width = height;
        ctx.save();
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -height);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        canvas.toBlob(blob => {
          fileItem._file = blob;
        }, 'image/jpeg', 0.7);
        img = null;
      };
    };
  }

  onProcessDone(event: Event, item): void {
    item['processing'] = false;
  }

  uploadAllImages(url?: string): void {
    if (url) {
      let options = this.uploader.options;
      options.url = url;
      this.uploader.setOptions(options)
    }
    this.uploader.uploadAll();
    this.uploader.onCompleteAll = () => {
      //uploading canceled item
      if (this.uploader.getNotUploadedItems().length > 0) {
        setTimeout(() => {
          this.uploader.uploadAll();
        }, 500);
      } else {
        setTimeout(() => {
          this.uploadCompleted.next(true);
          this.uploader.clearQueue();
          this.dropZoneTrigger = false;
          this.getProjectImages();
        }, 500);
      }
    };
  }

  openGallery(key, index): void {
    this.dialog.closeAll();
    this.customerGalleryDialogRef = this.dialog.open(dialogsMap[key], customerGalleryDialogConfig);

    this.customerGalleryDialogRef.componentInstance.gallery = this.projectImages;
    this.customerGalleryDialogRef.componentInstance.galleryActiveIndex = index;
  }

  private getProjectImages(): void {
    this.http.get<Array<string>>(this.apiUrl).subscribe(res => this.projectImages = res);
  }

  private resizeImage(file: File): Observable<Blob> {
    const compressedFileSubject: Subject<any> = new Subject<any>();
    const reader = new FileReader();
    const img = new Image();
    const type = file.type ? file.type : 'image/jpeg';
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onloadend = event => {
      img.src = (event as any).target.result;
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > this.MAX_WIDTH) {
            height *= this.MAX_WIDTH / width;
            width = this.MAX_WIDTH;
          }
        } else {
          if (height > this.MAX_HEIGHT) {
            width *= this.MAX_HEIGHT / height;
            height = this.MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        canvas.toBlob(blob => {
          compressedFileSubject.next(blob);
        }, type, this.COMPRESS_RATIO);
      };
    };
    return compressedFileSubject.asObservable();
  }

  private fileValidation(file: File): boolean {
    const allowedMimeType: Array<string> = FILE_MIME_TYPES.images;
    const maxFileSize: number = MAX_FILE_SIZE.bytes;
    if (!allowedMimeType.includes(file.type)) {

      return false;
    } else if (file.size > maxFileSize) {

      return false;
    } else {
      return true;
    }
  }

  private refreshAccessToken(): void {
    this.securityService.refreshAccessToken().subscribe(() => {
      this.uploader.setOptions(
        {authToken: this.securityService.getTokenHeader()}
      );
      this.refreshingAccessToken = false;
    });
  }

  private checkAccessToken(item: FileItem): void {
    if (this.securityService.isAuthenticated()) {
      if (this.securityService.isTokenExpired()) {
        //cancel upload if access token expired
        this.uploader.cancelItem(item);
        if (!this.refreshingAccessToken) {
          this.refreshingAccessToken = true;
          this.refreshAccessToken();
        }
      }
    }
  }

  private handleError(item: FileLikeObject, filter: any) {
    let text: string = '';
    switch (filter.name) {
      case 'mimeType':
        text = `The file type of ${item.name} is not allowed. \r\n You can only upload the following file types: .png, .jpg, .bmp.`;
        break;
      case 'fileSize':
        text = `The file ${item.name} has failed to upload. Maximum upload file size ${MAX_FILE_SIZE.megabytes} Mb.`;
        break;
      case 'queueLimit':
        text = `Query limit. You can add only ${IMAGE_UPLOADER_QUERY_LIMIT} images to upload query.`;
        break;
      default:
        text = 'Could not add image to upload query';
        break;
    }
    this.popupService.showError(text, 10000);
  }

}
