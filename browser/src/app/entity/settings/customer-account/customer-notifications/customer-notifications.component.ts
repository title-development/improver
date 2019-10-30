import { Component } from '@angular/core';
import { Constants } from "../../../../util/constants";
import { Messages } from "../../../../util/messages";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../../auth/security.service";
import { RequestOptions } from "@angular/http";

import { AccountService } from '../../../../api/services/account.service';
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import {
  ContractorNotificationSettings,
  CustomerNotificationSettings
} from "../../../../api/models/NotificationSettings";
import { getErrorMessage } from "../../../../util/functions";
import { UserService } from "../../../../api/services/user.service";

@Component({
  selector: 'notifications',
  templateUrl: './customer-notifications.component.html',
  styleUrls: ['./customer-notifications.component.scss']
})

export class CustomerNotificationsComponent {

  notificationSettings: CustomerNotificationSettings;

  constructor(public constants: Constants,
              public messages: Messages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService) {

    this.getNotificationSettings();

  }

  getNotificationSettings() {
    this.accountService.getNotificationSettings().subscribe(
      notificationSettings => {
        this.notificationSettings = notificationSettings;
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

  updateNotificationSettings() {
    this.accountService.updateNotificationSettings(this.notificationSettings).subscribe(
      responce => {
        this.popUpService.showSuccess("Your notification settings updated successfully")
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

}
