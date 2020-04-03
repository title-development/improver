import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { Constants } from '../../../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { QuickReplyService } from '../../../../api/services/quick-replay.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { Messages } from '../../../../util/messages';


@Component({
  selector: 'quick-reply',
  templateUrl: './quick-reply.component.html',
  styleUrls: ['./quick-reply.component.scss']
})

export class QuickReplyComponent implements OnInit {

  saveProcessing: boolean = false;
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
              public messages: Messages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              public quickReplayService: QuickReplyService,
              public popUpService: PopUpMessageService) {

    this.getQuickReplayMessage();

  }

  ngOnInit() {

  }

  getQuickReplayMessage() {
    this.fetching = true;
    this.quickReplayService.getQuickReplayMessage(this.securityService.getLoginModel().id)
      .subscribe((quickReplyMessage) => {
        this.fetching = false;
        this.quickReply = quickReplyMessage;
        this.initialQuickReply = {...{}, ...quickReplyMessage};
      }, err => {
        console.error(err);
      });

  }

  submitQuickReplayMessage(form) {
    this.saveProcessing = true;
    this.quickReplayService.updateQuickReplayMessage(this.securityService.getLoginModel().id, this.quickReply)
      .subscribe(() => {
        this.saveProcessing = false;
        this.popUpService.showSuccess('Quick replay message updated successfully');
        this.getQuickReplayMessage();
      }, err => {
        console.error(err);
        this.saveProcessing = false;
      });
  }

  resetQuickReplayMessage() {
    this.quickReply = {...{}, ...this.initialQuickReply};
  }

}
