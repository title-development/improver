import { Component } from '@angular/core';
import { Constants } from "../../../../util/constants";
import { TextMessages } from "../../../../util/text-messages";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../../auth/security.service";
import { AccountService } from '../../../../api/services/account.service';
import { CompanyService } from "../../../../api/services/company.service";
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";
import { ContractorNotificationSettings } from "../../../../api/models/NotificationSettings";
import { finalize, first } from "rxjs/operators";

@Component({
  selector: 'communication-settings',
  templateUrl: './communication-settings.component.html',
  styleUrls: ['./communication-settings.component.scss']
})

export class CommunicationSettingsComponent {

  notificationSettings: ContractorNotificationSettings;
  settingsUpdating = false;

  constructor(public constants: Constants,
              public messages: TextMessages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private companyService: CompanyService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService) {

    this.getNotificationSettings();

  }

  getNotificationSettings() {
    this.companyService.getNotificationSettings(this.securityService.getLoginModel().company)
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
    this.companyService.updateNotificationSettings(this.securityService.getLoginModel().company, this.notificationSettings)
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
