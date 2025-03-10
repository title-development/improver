import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractorProject } from '../../../model/data-model';
import { ProjectService } from '../../../api/services/project.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { completeProjectDialogConfig, customerGalleryDialogConfig } from '../../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MediaQuery, MediaQueryService } from '../../../api/services/media-query.service';
import { Subscription } from 'rxjs';
import * as Swiper from 'swiper/dist/js/swiper.min';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { ProjectActionService } from '../../../api/services/project-action.service';
import { NavigationHelper } from "../../../util/helpers/navigation-helper";

@Component({
  selector: 'contractor-project-view',
  templateUrl: './contractor-project-view.component.html',
  styleUrls: ['./contractor-project-view.component.scss'],
  animations: [
    trigger('slide', [
      state('showed', style({transform: 'translateX(0)', opacity: 1})),
      state('hide', style({transform: 'translateX(100%)', opacity: 0})),
      transition('hide <=> showed', animate('400ms ease-in-out')),
    ])
  ]
})
export class ContractorProjectViewComponent implements OnDestroy, AfterViewInit {
  project: ContractorProject;
  files: File[];
  showContractorInformation: 'showed' | 'void' | 'hide' = 'void';
  maxPreviewImageCount: number = -1;
  customerGalleryDialogRef: MatDialogRef<any>;
  refundDialog: MatDialogRef<any>;
  mediaQuery: MediaQuery;
  showLeftAlignedClass: boolean;
  truncateNotes = 300;
  @ViewChild('notes') notes: ElementRef;
  ProjectRequest = ProjectRequest;

  private projectRequestId: string;
  private sub: any;
  private swiper: Swiper;
  private getForContractor$: Subscription;
  private onProjectsUpdate$: Subscription;
  private swiperConfig: SwiperOptions = {
    spaceBetween: 18,
    centeredSlides: true,
    slidesPerView: 5,
    touchRatio: 0.2,
    loop: true,
    onClick: (swiper: Swiper, event: MouseEvent) => {
      const slide: HTMLElement = (event.target as HTMLElement).parentElement;
      this.openGallery(slide.getAttribute('data-swiper-slide-index'), this.project.images);
    }
  };
  private mediaQuerySubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              public projectActionService: ProjectActionService,
              private navigationHelper: NavigationHelper,
              public router: Router,
              public dialog: MatDialog,
              public mediaQueryService: MediaQueryService) {
    this.sub = this.route.params.subscribe(params => {
      params['projectRequestId'] ? this.projectRequestId = params['projectRequestId'].toString() : this.projectRequestId = '';
      this.getProject();
    });
    this.mediaQuerySubscription = this.mediaQueryService.screen.subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
      this.isLeftAligned();
      if (mediaQuery.md) {
        this.maxPreviewImageCount = 2;
        this.destroySwiper();
        this.showContractorInformation = 'void';
      } else if (mediaQuery.lg || mediaQuery.xlg) {
        this.maxPreviewImageCount = 3;
        this.showContractorInformation = 'void';
        this.destroySwiper();
      } else if (mediaQuery.sm || mediaQuery.xs) {
        this.maxPreviewImageCount = -1;
        this.showContractorInformation = 'hide';
        if (this.swiper === null) {
          setTimeout(() => this.swiper = new Swiper('.gallery', this.swiperConfig), 0);
        }
      }
    });
    this.onProjectsUpdate$ = projectActionService.onProjectsUpdate.subscribe(() => {
      this.getProject();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.mediaQuerySubscription) {
      this.mediaQuerySubscription.unsubscribe();
    }
    if (this.getForContractor$) {
      this.getForContractor$.unsubscribe();
    }
    if (this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
    this.destroySwiper();
  }

  ngAfterViewInit(): void {
    this.showLeftAlignedClass = this.isLeftAligned();
  }

  getProject() {
    this.getForContractor$ = this.projectService
      .getForContractor(this.projectRequestId)
      .subscribe(
        project => {
          this.project = project;
          if (this.mediaQuery.xs || this.mediaQuery.sm) {
            setTimeout(() => {
              this.swiper = new Swiper('.gallery', this.swiperConfig);
              this.isLeftAligned();
            }, 0);
          }
        },
        err => {
          console.error(err);
          if (err.status == 404) {
            this.router.navigate(['404']);
          }
        }
      );
  }

  updateProjectRequestStatus(status: ProjectRequest.Status) {
    this.project.status = status;
  }

  openGallery(index, images): void {
    this.dialog.closeAll();
    this.customerGalleryDialogRef = this.dialog.open(dialogsMap['image-viewer'], customerGalleryDialogConfig);

    this.customerGalleryDialogRef.componentInstance.gallery = images;
    this.customerGalleryDialogRef.componentInstance.galleryActiveIndex = index;
  }

  openRequestRefundDialog(project): void {
    this.dialog.closeAll();
    this.refundDialog = this.dialog.open(dialogsMap['request-refund-dialog'], completeProjectDialogConfig);
    this.refundDialog
      .afterClosed()
      .subscribe(result => {
        this.refundDialog = null;
      });
    this.refundDialog.componentInstance.project = project;
  }

  openRefundStatusDialog(project): void {
    this.dialog.closeAll();
    this.refundDialog = this.dialog.open(dialogsMap['refund-status-dialog'], completeProjectDialogConfig);
    this.refundDialog
      .afterClosed()
      .subscribe(result => {
        this.refundDialog = null;
      });
    this.refundDialog.componentInstance.project = project;
  }

  toggleContractorInformation() {
    if (this.showContractorInformation == 'showed') {
      this.showContractorInformation = 'hide';
    } else {
      this.showContractorInformation = 'showed';
    }
  }

  isLeftAligned(): boolean {
    if (this.notes) {
      return this.notes.nativeElement.getBoundingClientRect().width + 50 >= window.innerWidth;
    } else {
      return false;
    }
  }

  private destroySwiper(): void {
    if (this.swiper && this.swiper.destroy) {
      this.swiper.destroy(true, true);
    }
    this.swiper = null;
  }

  back() {
    if(this.showContractorInformation == 'showed') {
      this.showContractorInformation = 'hide'
    } else {
      this.router.navigate(['/pro/dashboard'])
    }
  }

}
