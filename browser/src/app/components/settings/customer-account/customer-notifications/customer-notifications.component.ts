import { Component } from '@angular/core';
import { Constants } from "../../../../util/constants";
import { TextMessages } from "../../../../util/text-messages";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../../auth/security.service";
import { AccountService } from '../../../../api/services/account.service';
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { CustomerNotificationSettings } from "../../../../api/models/NotificationSettings";
import { getErrorMessage } from "../../../../util/functions";
import { finalize, first } from "rxjs/operators";

@Component({
  selector: 'communication-settings',
  templateUrl: './customer-notifications.component.html',
  styleUrls: ['./customer-notifications.component.scss']
})

export class CustomerNotificationsComponent {

  notificationSettings: CustomerNotificationSettings;
  settingsUpdating = false;

  constructor(public constants: Constants,
              public messages: TextMessages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService) {

    this.getNotificationSettings();

  }

  getNotificationSettings() {
    this.accountService.getNotificationSettings()
      .pipe(first())
      .subscribe(
      notificationSettings => {
        this.notificationSettings = notificationSettings;
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

  updateNotificationSettings() {
    this.settingsUpdating = true;
    this.accountService.updateNotificationSettings(this.notificationSettings)
      .pipe(first(), finalize(() => this.settingsUpdating = false))
      .subscribe(
      responce => {
        this.popUpService.showSuccess("Your notification settings updated successfully")
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

}
