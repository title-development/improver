import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { mobileMainDialogBarConfig } from '../../shared/dialogs/dialogs.configs';
import { Role } from '../../model/security-model';
import { NotificationResource } from '../../util/notification.resource';
import { BillingService } from '../../api/services/billing.service';
import { SecurityService } from '../../auth/security.service';
import { Subject } from 'rxjs';
import { ProjectService } from '../../api/services/project.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { MediaQuery, MediaQueryService } from "../../api/services/media-query.service";
import { takeUntil, tap } from 'rxjs/operators';
import { RequestOrder } from "../../model/order-model";
import { AccountService } from "../../api/services/account.service";
import { MobileMenuService } from "../../api/services/mobile-menu-service";
import { MetricsEventService } from "../../api/services/metrics-event.service";

@Component({
  selector: 'layout-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})

export class HeaderComponent {

  Role = Role;
  private dialogRef: MatDialogRef<any>;
  private readonly destroyed$ = new Subject<void>();
  public mediaQuery: MediaQuery;

  constructor(private dialog: MatDialog,
              public billingService: BillingService,
              public notificationResource: NotificationResource,
              public projectService: ProjectService,
              public securityService: SecurityService,
              public mediaQueryService: MediaQueryService,
              public accountService: AccountService,
              public mobileMenuService: MobileMenuService,
              private metricsEventService: MetricsEventService) {

    this.subscribeForMediaScreen();

    this.securityService.onUserInit.subscribe(() => {
      this.postUnsavedOrder();
    });

  }


  subscribeForMediaScreen(): void {
    this.mediaQueryService.screen.asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mediaQuery: MediaQuery) => {
        this.mediaQuery = mediaQuery;
      });
  }

  toggleFindProfessionalsMobile(): void {
    if(this.mobileMenuService.findProfessionalsOpened) {
      this.dialog.closeAll();
      return;
    }

    this.mobileMenuService.mobileMenuOpened = false;
    this.mobileMenuService.notificationsPopupOpened = false;
    this.dialog.closeAll();
    this.dialogRef = this.dialog.open(dialogsMap['mobile-main-search-bar'], mobileMainDialogBarConfig);
    this.mobileMenuService.findProfessionalsOpened = true;
    this.dialogRef
      .afterClosed()
      .subscribe(result => {
          this.mobileMenuService.findProfessionalsOpened = false;
          this.dialogRef = null;
        }
      );
  }

  /** Save projects that was created by anonymous user */
  private postUnsavedOrder() {

    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let maxExpirationDays = 7;
    let now = new Date();

    if (this.securityService.hasRole(Role.CUSTOMER) && localStorage.getItem('unsavedProjects')) {
      let unsavedProjects: any = JSON.parse(localStorage.getItem('unsavedProjects'));
      let requests = [];

      for (let key in unsavedProjects) {
        let project: RequestOrder = unsavedProjects[key];
        let diffDays = Math.round(Math.abs((now.getTime() - Date.parse(key)) / (oneDay)));

        this.accountService.getAccount(this.securityService.getLoginModel().id).subscribe(account => {
          if (project.defaultQuestionaryGroup.email.toLowerCase() == account.email.toLowerCase() && diffDays <= maxExpirationDays) {
            this.projectService.postUnsavedProjects(project)
              .pipe(tap( () => {
                localStorage.removeItem('unsavedProjects')
                this.metricsEventService.fireProjectRequestedEvent();
              }))
              .subscribe();
          }
        });
      }
    }

  }

}

