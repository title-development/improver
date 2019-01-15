import { Component, Input, OnInit } from '@angular/core';
import { PhoneHelpService } from '../../util/phone-help.service';
import { Constants } from '../../util/constants';
import { Messages } from '../../util/messages';
import { PhoneHelpState } from '../../util/phone-help.service';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { getErrorMessage } from "../../util/functions";

@Component({
  selector: 'phone-help',
  templateUrl: 'phone-help.component.html',
  styleUrls: [ 'phone-help.component.scss' ]
})

export class PhoneHelpComponent implements OnInit {

  public PhoneHelpState = PhoneHelpState;

  callRequest: any = {
    name: "",
    phone: ""
  };

  constructor(public phoneHelpService: PhoneHelpService,
              public constants: Constants,
              public messages: Messages,
              public popUpService: PopUpMessageService) {
  }

  ngOnInit() {

  }

  onSubmit(form) {
    this.phoneHelpService.requestCall(this.callRequest.name, this.callRequest.phone).subscribe(
      res => {
        this.popUpService.showSuccess("Your request for a call is successfully submitted");
        this.phoneHelpService.hide();
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }


}
