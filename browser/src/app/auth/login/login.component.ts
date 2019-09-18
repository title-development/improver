import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { LoginModel } from '../../model/security-model';
import { SystemMessageType } from '../../model/data-model';
import { ProjectService } from '../../api/services/project.service';
import { HttpResponse } from '@angular/common/http';
import { getErrorMessage } from '../../util/functions';
import { RecaptchaComponent } from 'ng-recaptcha';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Component({
  selector: 'login-page',
  templateUrl: 'login.component.html',
  styleUrls: ['../shared/auth.scss']
})
export class LoginComponent implements OnDestroy {

  credentials = {
    email: '',
    password: '',
    captcha: ''
  };

  showMessage: boolean = false;
  messageType: string;
  messageText: string;

  processing: boolean = false;

  @ViewChild(RecaptchaComponent)
  recaptcha: RecaptchaComponent;

  private readonly destroyed$ = new Subject<void>();

  constructor(
    public securityService: SecurityService,
    public projectService: ProjectService,
    public constants: Constants,
    public messages: Messages,
  ) {}

  onSubmit(form: NgForm) {
    this.processing = true;
    this.recaptcha.execute();
    this.recaptcha.resolved.pipe(
      timeoutWith(this.constants.ONE_MINUTE, throwError({error:{message: 'Timeout error please try again later'}})),
      mergeMap((captcha: string | null) => {
        if(!captcha) {
          return throwError({error:{message: 'Captcha is expired please try again later'}});
        }
        this.credentials.captcha = captcha;
        return this.securityService.sendLoginRequest(this.credentials)
      }),
      takeUntil(this.destroyed$),
    )
    .subscribe((response: HttpResponse<any>) => {
        this.processing = false;
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
      },
      err => {
        this.recaptcha.reset();
        this.processing = false;
        if (err.status == 401) {
          this.securityService.systemLogout();
          this.messageText = getErrorMessage(err);
        } else {
          this.messageText = getErrorMessage(err);
        }
        this.messageType = SystemMessageType.ERROR;
        this.showMessage = true;
      });
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
