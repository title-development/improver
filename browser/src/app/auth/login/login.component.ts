import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { LoginModel } from '../../model/security-model';
import { SystemMessageType } from '../../model/data-model';
import { ProjectService } from '../../api/services/project.service';
import { getErrorMessage } from '../../util/functions';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: 'login-page',
  templateUrl: 'login.component.html',
  styleUrls: ['../shared/auth.scss']
})
export class LoginComponent implements OnDestroy {

  @ViewChild(RecaptchaComponent)
  recaptcha: RecaptchaComponent;

  private readonly destroyed$ = new Subject<void>();

  credentials = {
    email: '',
    password: '',
    captcha: ''
  };

  processing: boolean = false;
  showMessage: boolean = false;
  messageType: string;
  messageText: string;

  constructor(
    public securityService: SecurityService,
    public projectService: ProjectService,
    public constants: Constants,
    public messages: Messages,
  ) {
  }

  resolveCaptcha(captcha) {
      if(captcha) {
        this.login(captcha);
      } else {
        this.processing = false;
      }
  }

  onSubmit(form: NgForm) {
    this.showMessage = false;
    this.processing = true;
    if (this.securityService.captchaEnabled) {
      this.recaptcha.execute();
    } else {
      this.login();
    }
  }

  login(captcha?) {
    this.credentials.captcha = captcha;
    this.securityService.sendLoginRequest(this.credentials)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.recaptcha.reset())
      )
      .subscribe(response => {
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
      }, err => {
        if (err.status == 401) {
          this.securityService.logoutFrontend();
        }
        this.showResponseMessage(getErrorMessage(err), SystemMessageType.ERROR);
        this.processing = false;
      })
  }

  showResponseMessage(messageText, messageType) {
    this.messageText = messageText;
    this.messageType = messageType;
    this.showMessage = true;
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
