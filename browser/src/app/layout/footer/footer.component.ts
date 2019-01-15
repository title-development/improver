import { Component, Inject } from '@angular/core';

import { ScrollService } from "app/util/scroll.service";
import { PhoneHelpService } from "../../util/phone-help.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { Role } from "../../model/security-model";
import { Constants } from "../../util/constants";
import { Messages } from "../../util/messages";
import { getErrorMessage } from "../../util/functions";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'layout-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.scss']
})


export class FooterComponent {
  public Role = Role;

  callRequest: any = {
    name: "",
    phone: ""
  };

  constructor(@Inject('Window') public window: Window,
              public scrollService: ScrollService,
              public phoneHelpService: PhoneHelpService,
              public popUpMessageService: PopUpMessageService,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              public popUpService: PopUpMessageService) {
  }

  submitPhoneHelpRequest(form: NgForm) {
    console.log("submitPhoneHelpRequest");
    this.phoneHelpService.requestCall(this.callRequest.name, this.callRequest.phone).subscribe(
      res => {
        this.popUpService.showSuccess("Your request for a call is successfully submitted");
        this.phoneHelpService.hide();
        form.reset();
        form.resetForm();
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }

}




