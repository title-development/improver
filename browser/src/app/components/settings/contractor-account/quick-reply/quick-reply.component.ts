import { Component } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { Constants } from '../../../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { QuickReplyService } from '../../../../api/services/quick-replay.service';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { TextMessages } from '../../../../util/text-messages';
import { finalize, first } from "rxjs/operators";
import { getErrorMessage } from "../../../../util/functions";


@Component({
  selector: 'quick-reply',
  templateUrl: './quick-reply.component.html',
  styleUrls: ['./quick-reply.component.scss']
})

export class QuickReplyComponent {

  updateProcessing: boolean = false;
  fetching: boolean = true;
  initialQuickReply = {
    enabled: false,
    text: ''
  };
  quickReply = {
    enabled: false,
    text: ''
  };

  constructor(public constants: Constants,
              public messages: TextMessages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              public quickReplayService: QuickReplyService,
              public popUpService: PopUpMessageService) {
    this.getQuickReplayMessage();
  }

  getQuickReplayMessage() {
    this.fetching = true;
    this.quickReplayService.getQuickReplayMessage(this.securityService.getLoginModel().id)
      .pipe(first())
      .subscribe((quickReplyMessage) => {
        this.fetching = false;
        this.quickReply = quickReplyMessage;
        this.initialQuickReply = {...{}, ...this.quickReply};
      }, err => {
        console.error(err);
      });

  }

  updateQuickReplayMessage(form) {
    this.updateProcessing = true;
    this.quickReplayService.updateQuickReplayMessage(this.securityService.getLoginModel().id, this.quickReply)
      .pipe(first() , finalize(() => this.updateProcessing = false))
      .subscribe(() => {
        this.initialQuickReply = {...{}, ...this.quickReply};
        this.popUpService.showSuccess('Auto replay message updated successfully');
      }, err => {
        console.error(err);
        this.popUpService.showSuccess(getErrorMessage(err));
      });
  }

  resetQuickReplayMessage() {
    this.quickReply = {...{}, ...this.initialQuickReply};
  }

}
