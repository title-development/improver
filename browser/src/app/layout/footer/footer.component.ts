import { Component, Inject } from '@angular/core';

import { ScrollService } from "app/api/services/scroll.service";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { Role } from "../../model/security-model";
import { Constants } from "../../util/constants";
import { TextMessages } from "../../util/text-messages";

@Component({
  selector: 'layout-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.scss']
})


export class FooterComponent {
  public Role = Role;

  constructor(@Inject('Window') public window: Window,
              public scrollService: ScrollService,
              public popUpMessageService: PopUpMessageService,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: TextMessages,
              public popUpService: PopUpMessageService) {
  }

}




