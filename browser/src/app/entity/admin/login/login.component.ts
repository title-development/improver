import { Component } from '@angular/core';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { NgForm } from '@angular/forms';
import { LoginModel } from '../../../model/security-model';


import { MessageService } from 'primeng/components/common/messageservice';
import { first } from "rxjs/internal/operators";

@Component({
  selector: 'admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AdminLoginComponent {

  credentials = {
    email: '',
    password: ''
  };

  constructor(private securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private messageService: MessageService) {

  }

  submit(form: NgForm): void {
    const values = form.value;
    this.securityService.sendLoginRequest(values).pipe(first()).subscribe(
      response => {
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
      }, fail => {
        this.messageService.add({severity: 'error', summary: 'Authorization error', detail: fail.error.message});
      });
  }
}
