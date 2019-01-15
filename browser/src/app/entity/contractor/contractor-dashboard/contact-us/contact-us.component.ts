import { Component, OnInit } from '@angular/core';
import { PopUpMessageService } from "../../../../util/pop-up-message.service";

@Component({
  selector: 'dashboard-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  constructor(public popUpMessageService: PopUpMessageService) {

  }

  ngOnInit() {
  }

}
