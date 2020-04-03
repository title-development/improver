import { Component, Inject, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { CompanyProfile } from '../../../model/data-model';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import {
  addLicenseDialogConfig,
  personalPhotoDialogConfig,
  unavailabilityPeriodDialogConfig
} from '../../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompanyReviewsComponent } from './company-reviews/company-reviews.component';
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';
import { GoogleMapUtilsService } from '../../../util/google-map.utils';
import { fromEvent, Subject } from 'rxjs';
import { defaultMapOptions } from '../../../util/google-map-default-options';
import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { ReviewService } from '../../../api/services/review.service';
import { GlueBlockDirective } from '../../../directives/glue-block.directive';
import { getErrorMessage, resizeImage } from '../../../util/functions';

import { FILE_MIME_TYPES, MAX_FILE_SIZE } from '../../../util/file-parameters';


import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { ErrorHandler } from '../../../util/error-handler';
import { Company } from '../../../api/models/Company';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ScrollService } from '../../../util/scroll.service';
import { CeoService } from "../../../util/ceo.service";

@Component({
  selector: 'customer-profile-page',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit, OnDestroy {

  private readonly destroyed$ = new Subject<void>();

  @ViewChild(CompanyReviewsComponent) companyReviewsComp: CompanyReviewsComponent;
  @ViewChildren(GlueBlockDirective) glueBoxDirectives: QueryList<GlueBlockDirective>;

  editMode: boolean = false;
  isReviewSend = false;
  projectRequest: ProjectRequest;
  mapOptions: MapOptions = defaultMapOptions;
  map: any;
  companyId: any;
  companyProfile: CompanyProfile;
  truncateAboutInfo = 300;
  truncateOfferedServicesInfo = 10;
  fixProfileHeader: boolean = false;
  postReviewDialogRef: MatDialogRef<any>;
  boxGlue: boolean = true;
  mediaQuery: MediaQuery;
  backgroundProcessing = false;
  private hashFragment: string;
  private licenseDialogRef: MatDialogRef<any>;
  private photoDialogRef: MatDialogRef<any>;
  private requestReviewDialogRef: MatDialogRef<any>;
  private scrollHolder: Element = document.getElementsByClassName('scroll-holder')[0];
  scrollHandler = () => this.onScroll();

  constructor(@Inject('Window') private window: Window,
              private renderer: Renderer2,
              private gMapUtils: GoogleMapUtilsService,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public dialog: MatDialog,
              public mediaQueryService: MediaQueryService,
              public reviewService: ReviewService,
              public popupService: PopUpMessageService,
              public router: Router,
              private scrollService: ScrollService,
              private errorHandler: ErrorHandler,
              private ceoService: CeoService) {
    this.route.queryParams.subscribe(params => {
      if (params['review-token']) {
        localStorage.setItem('review-token', params['review-token']);
      }
    });

    this.route.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
      if (params['companyId'].toString()) {
        this.companyId = params['companyId'].toString();

        this.getCompanyProfile(this.companyId);
      } else {
        this.router.navigate(['404']);
      }
    });

    this.route.fragment
      .pipe(takeUntil(this.destroyed$))
      .subscribe(fragment => {
      this.hashFragment = fragment;
    });

    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
      if (mediaQuery.xs || mediaQuery.sm) {
        this.boxGlue = false;
      } else {
        this.boxGlue = true;
      }
    });

    this.scrollHolder.addEventListener('scroll', this.scrollHandler);
  }

  onScroll(): void {
    if (this.scrollHolder.scrollTop > 261 && this.boxGlue) {
      this.fixProfileHeader = true;
    } else {
      this.fixProfileHeader = false;
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.scrollHolder.removeEventListener('scroll', this.scrollHandler);
    this.ceoService.reset();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updateGlueBox(state: boolean): void {
    if (state) {
      this.glueBoxDirectives.forEach((item) => {
        item.updateWithAttempts();
      });
    }
  }

  getCompanyProfile(id: any): void {
    this.companyService.getProfile(id)
      .subscribe(
        companyProfile => {
          this.companyProfile = companyProfile;
          this.editMode = this.companyProfile.owner;
          if (this.companyProfile.deleted) {
            this.router.navigate(['404']);
            return;
          } else {
            this.ceoService.companyProfile(companyProfile)
          }
          if (this.hashFragment && this.hashFragment.length > 0) {
            setTimeout(() => {
              this.scrollService.scrollToElementById(this.hashFragment);
            }, 1000);
          }
        },
        err => {
          console.error(err);
          if (err.status == 404) {
            this.router.navigate(['404']);
          } else {
            this.popupService.showError(getErrorMessage(err));
          }
        });

  }

  showMoreContent(truncate: number, variable): void {
    variable = truncate;
  }

  onMapReady(map): void {
    this.map = map;
    this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(this.companyProfile.location.lat, this.companyProfile.location.lng));
    this.map.setCenter(new google.maps.LatLng(this.companyProfile.location.lat, this.companyProfile.location.lng));
  }

  requestReview(): void {
    this.requestReviewDialogRef = this.dialog.open(dialogsMap['request-review-dialog'], unavailabilityPeriodDialogConfig);
    this.requestReviewDialogRef.componentInstance.companyName = this.companyProfile.name;
  }

  openDialogAddReview(companyProfile): void {
    const reviewToken = localStorage.getItem('review-token');
    this.reviewService.getReviewOptions(this.companyId, '0', reviewToken).subscribe(
      res => this.openWriteReviewDialog(companyProfile),
      err => {
        this.errorHandler.unauthorized(err, '', () => this.openWriteReviewDialog(companyProfile));
        this.errorHandler.unprocessableEntity(err, getErrorMessage(err), () => this.clearUrlQueryParams());
        this.errorHandler.conflict(err, getErrorMessage(err));
        this.errorHandler.notFound(err, "You don't have request to review this company");
        localStorage.removeItem('review-token');
        this.dialog.closeAll();
      }
    );
  }

  openLicenseDialog(licenseId?): void {
    this.dialog.closeAll();
    this.licenseDialogRef = this.dialog.open(dialogsMap['add-license-dialog'], addLicenseDialogConfig);
    this.licenseDialogRef
      .afterClosed()
      .subscribe(result => {
        this.licenseDialogRef = null;
      });

    this.licenseDialogRef.componentInstance.licenseId = licenseId;

    this.licenseDialogRef.componentInstance.onLicenseAdded.subscribe(
      () => {
        this.getCompanyProfile(this.companyId);
      }
    );

  }

  fileChangeListener($event): void {
    this.backgroundProcessing = true;
    let file: File = $event.target.files[0];
    let img = new Image();
    if (file && this.fileValidation(file)) {
      let reader = new FileReader();
      reader.readAsDataURL(file);

      let onload = fromEvent(reader, 'load');
      let onerror = fromEvent(reader, 'error');

      onload.subscribe(() => {
        img.src = reader.result as string;
        img.onload = () => {
          this.companyService.updateCover(this.companyId, resizeImage(img, 1920)).subscribe(
            () => {
              this.popupService.showSuccess('Background is updated');
              this.backgroundProcessing = false;
              this.getCompanyProfile(this.companyId);
            }, err => {
              this.backgroundProcessing = false;
              this.popupService.showError(getErrorMessage(err));
            }
          );
        };

      });

      onerror.subscribe(error => {
        console.error(error);
        this.backgroundProcessing = false;
      });

    } else {
      this.backgroundProcessing = false;
    }
  }

  fileValidation(file: File): boolean {
    const allowedMimeType: Array<string> = FILE_MIME_TYPES.images;
    const maxFileSize: number = MAX_FILE_SIZE.bytes;
    let errorMessage: string;
    if (!allowedMimeType.includes(file.type)) {
      errorMessage = `The file type of ${file.name} is not allowed. \r\n You can only upload the following file types: .png, .jpg, .bmp.`;
      this.popupService.showError(errorMessage);

      return false;
    } else if (file.size > maxFileSize) {
      errorMessage = `The file ${file.name} has failed to upload. Maximum upload file size ${MAX_FILE_SIZE.megabytes} Mb.`;
      this.popupService.showError(errorMessage);

      return false;
    } else {
      return true;
    }
  }

  openDialogPhoto(): void {
    this.dialog.closeAll();
    this.photoDialogRef = this.dialog.open(dialogsMap['account-edit-photo-dialog'], personalPhotoDialogConfig);
    this.photoDialogRef.componentInstance.originalImage = this.companyProfile.iconUrl;
    this.photoDialogRef.componentInstance.title = 'Company logo';
    this.photoDialogRef.componentInstance.onPhotoReady.pipe(
      switchMap(
        (base64: string) => {
          return this.companyService.updateLogo(this.companyProfile.id, base64);
        }
      )
    ).subscribe(
      res => {
        this.popupService.showSuccess('Company has been updated');
        this.setCompanyIconUrl(res.body);
      },
      err => this.popupService.showError(getErrorMessage(err)));
  }

  private openWriteReviewDialog(companyProfile: Company) {
    this.dialog.closeAll();
    this.postReviewDialogRef = this.dialog.open(dialogsMap['add-review'], personalPhotoDialogConfig);
    this.postReviewDialogRef.componentInstance.companyProfile = companyProfile;
    this.postReviewDialogRef.componentInstance.onPostReview.subscribe(() => {
      this.companyReviewsComp.getReviews();
      this.isReviewSend = true;
      this.popupService.showSuccess('Review has been added');
      this.clearUrlQueryParams();
      // TODO: Made for updating rating and review count. Later this params will be in separate endpoint
      // this.getCompanyProfile(this.companyId)
    });
  }

  private setCompanyIconUrl(iconUrl: string) {
    this.companyProfile.iconUrl = iconUrl;
    // update loginModel icon
    this.securityService.getCurrentUser();
  }

  private clearUrlQueryParams(): void {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {'review-token': null},
      queryParamsHandling: 'merge'
    });
  }
}
