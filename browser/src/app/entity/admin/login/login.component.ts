import { Component, OnDestroy, ViewChild } from '@angular/core';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { NgForm } from '@angular/forms';
import { LoginModel } from '../../../model/security-model';


import { MessageService } from 'primeng/components/common/messageservice';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/internal/operators';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subject, throwError } from 'rxjs';

@Component({
  selector: 'admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AdminLoginComponent implements OnDestroy {

  @ViewChild(RecaptchaComponent)
  recaptcha: RecaptchaComponent;

  credentials = {
    email: '',
    password: '',
    captcha: ''
  };

  private readonly destroyed$ = new Subject<void>();

  constructor(private securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private messageService: MessageService) {

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  submit(form: NgForm): void {
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
    ).subscribe(response => {
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
      }, fail => {
        this.recaptcha.reset();
        this.messageService.add({severity: 'error', summary: 'Authorization error', detail: fail.error.message});
      });
  }
}
