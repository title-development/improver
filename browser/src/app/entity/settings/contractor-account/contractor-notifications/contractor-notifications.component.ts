import { Component } from '@angular/core';
import { Constants } from "../../../../util/constants";
import { Messages } from "../../../../util/messages";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../../auth/security.service";
import { AccountService } from '../../../../api/services/account.service';
import { CompanyService } from "../../../../api/services/company.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";
import { ContractorNotificationSettings } from "../../../../api/models/NotificationSettings";

@Component({
  selector: 'notifications',
  templateUrl: './contractor-notifications.component.html',
  styleUrls: ['./contractor-notifications.component.scss']
})

export class ContractorNotificationsComponent {

  notificationSettings: ContractorNotificationSettings;

  constructor(public constants: Constants,
              public messages: Messages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private companyService: CompanyService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService) {

    this.getNotificationSettings();

  }

  getNotificationSettings() {
    this.companyService.getNotificationSettings(this.securityService.getLoginModel().company).subscribe(
      notificationSettings => {
        this.notificationSettings = notificationSettings;
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

  updateNotificationSettings() {
    this.companyService.updateNotificationSettings(this.securityService.getLoginModel().company, this.notificationSettings).subscribe(
      responce => {
        this.popUpService.showSuccess("Your notification settings updated successfully")
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      }
    )
  }

}
