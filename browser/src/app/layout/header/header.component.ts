import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { questionaryDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { Role } from '../../model/security-model';
import { NotificationResource } from '../../util/notification.resource';
import { BillingService } from '../../api/services/billing.service';
import { SecurityService } from '../../auth/security.service';
import { forkJoin, Subject } from 'rxjs';
import { ProjectService } from '../../api/services/project.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { ScrollHolderService } from '../../util/scroll-holder.service';
import { MediaQuery, MediaQueryService } from "../../util/media-query.service";
import { takeUntil, tap } from 'rxjs/operators';
import { RequestOrder } from "../../model/order-model";
import { AccountService } from "../../api/services/account.service";

@Component({
  selector: 'layout-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})

export class HeaderComponent {

  Role = Role;
  isMobMenuOpened: boolean = false;
  isNotificationsPopupOpened: boolean = false;
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
              private scrollHolder: ScrollHolderService) {

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

  toggleMenu(): void {
    this.isMobMenuOpened = !this.isMobMenuOpened;
  }

  open(key): void {
    this.dialog.closeAll();
    this.dialogRef = this.dialog.open(dialogsMap[key], questionaryDialogConfig);
    this.dialogRef
      .afterClosed()
      .subscribe(result => {
          this.dialogRef = null;
        }
      );
  }

  /** Save projects that was created by anonymous user
   */
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
              .pipe(tap( () => localStorage.removeItem('unsavedProjects')))
              .subscribe();
          }
        });
      }
    }

  }

}

