import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Renderer2, } from '@angular/core';
import { FileItem, FileLikeObject, FileUploader } from 'ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../../../api/services/pop-up-message.service";
import { SecurityService } from "../../../../../auth/security.service";
import {
  FILE_MIME_TYPES,
  FILE_SIZE_MAX,
  PROJECT_ATTACHED_IMAGES_LIMIT,
  UPLOAD_IMAGE_COMPRESS_RATIO,
  UPLOAD_IMAGE_MAX_HEIGHT,
  UPLOAD_IMAGE_MAX_WIDTH
} from "../../../../../util/file-parameters";
import { ProjectService } from "../../../../../api/services/project.service";
import { first } from "rxjs/operators";
import { ProjectActionService } from "../../../../../api/services/project-action.service";
import { BehaviorSubject } from "rxjs";
import { getErrorMessage } from "../../../../../util/functions";

@Component({
  selector: 'questionary-image-uploader',
  templateUrl: './questionary-image-uploader.component.html',
  styleUrls: ['./questionary-image-uploader.component.scss', './image-preview.scss'],
})
export class QuestionaryImageUploaderComponent implements OnInit {

  PROJECT_ATTACHED_IMAGES_LIMIT = PROJECT_ATTACHED_IMAGES_LIMIT;

  @Input() projectId: any;
  @Input() apiUrl: string;
  @Output() hasElements: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  @Output() processing: EventEmitter<boolean> = new EventEmitter<boolean>();

  hasBaseDropZoneOver: boolean = false;
  uploader: FileUploader;

  private confirmDialog: MatDialogRef<any>;
  private refreshingAccessToken: boolean = false;

  constructor(private projectService: ProjectService,
              private renderer: Renderer2,
              public dialog: MatDialog,
              private popupService: PopUpMessageService,
              private http: HttpClient,
              private securityService: SecurityService,
              private changeDetectorRef: ChangeDetectorRef,
              public projectActionService: ProjectActionService) {
  }

  ngOnInit(): void {
    this.apiUrl = this.apiUrl ? this.apiUrl : `/api/customers/projects/${this.projectId}/images`
    this.updateHasElements();

    this.uploader = new FileUploader({
      url: this.apiUrl,
      authToken: this.securityService.getTokenHeader(),
      allowedMimeType: FILE_MIME_TYPES.images,
      maxFileSize: FILE_SIZE_MAX.bytes,
      queueLimit: PROJECT_ATTACHED_IMAGES_LIMIT,
    });
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      this.handleError(item, filter);
    };
    this.uploader.onAfterAddingAll = (items: Array<FileItem>) => {
      this.uploader.queue.forEach((item: FileItem) => {
        this.resizeImage(item._file).subscribe((blob: Blob) => {
          item._file = (blob as File);
          this.changeDetectorRef.detectChanges()
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
      } else if (status == 422) {
        this.uploader.clearQueue()
      }
      this.popupService.showWarning(getErrorMessage({error: response}))
    };
  }

  hasUnsavedImages(): boolean {
    return this.uploader.getNotUploadedItems().length > 0;
  }

  fileOverBase(event: any): void {
    this.hasBaseDropZoneOver = event;
  }

  removeImageFromProject(event, imageUrl) {
    event.preventDefault();
    event.stopPropagation();
    this.projectActionService.projectImages = this.projectActionService.projectImages.filter(image => image != imageUrl);
    this.projectService.deleteImage(this.projectId, imageUrl)
      .pipe(first())
      .subscribe(() => {
        this.updateHasElements()
      })
  }

  onProcessDone(event: Event, item): void {
    this.processing.next(true);
    item.processing = false;
    this.changeDetectorRef.detectChanges()
    this.uploadAllImages()
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
          this.getProjectImages();
        }, 500);
      }
    };
  }

  private getProjectImages(): void {
    this.http.get<Array<string>>(this.apiUrl).subscribe(images => {
      this.projectActionService.projectImages = images
      this.uploader.clearQueue();
      this.updateHasElements()
      this.processing.next(false);
    });
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
          if (width > UPLOAD_IMAGE_MAX_WIDTH) {
            height *= UPLOAD_IMAGE_MAX_WIDTH / width;
            width = UPLOAD_IMAGE_MAX_WIDTH;
          }
        } else {
          if (height > UPLOAD_IMAGE_MAX_HEIGHT) {
            width *= UPLOAD_IMAGE_MAX_HEIGHT / height;
            height = UPLOAD_IMAGE_MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        canvas.toBlob(blob => {
          compressedFileSubject.next(blob);
          this.changeDetectorRef.detectChanges()
        }, type, UPLOAD_IMAGE_COMPRESS_RATIO);
      };
    };
    return compressedFileSubject.asObservable();
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
        text = `The file ${item.name} has failed to upload. Maximum upload file size ${FILE_SIZE_MAX.megabytes} Mb.`;
        break;
      case 'queueLimit':
        text = `You can add only ${PROJECT_ATTACHED_IMAGES_LIMIT} images to upload query`
        break;
      default:
        text = 'Failed to upload image';
        break;
    }
    this.popupService.showWarning(text);
  }

  updateHasElements () {
    this.hasElements.next(this.uploader?.queue?.length > 0 || this.projectActionService.projectImages.length > 0)
  }

  onFileDrop($event: File[]) {
    this.updateHasElements()
  }

}
