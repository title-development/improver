import { Component, OnDestroy } from '@angular/core';
import { Constants } from '../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { ActivationCustomerModel, LoginModel } from '../../model/security-model';
import { ActivationService } from '../../api/services/activation.service';
import { TextMessages } from '../../util/text-messages';
import { SecurityService } from '../security.service';
import { getErrorMessage } from '../../util/functions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-page',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})

export class ConfirmationComponent implements OnDestroy {
  step = 2;
  token = "";
  activationCustomerModel: ActivationCustomerModel = {
    token: "",
    password: "",
  };
  password = {
    confirm: ""
  };
  activationSuccess = false;
  emailConfirmationSuccess = false;
  confirmationErrorMessage: string;
  processing = false;

  get isConfirmationError(): boolean {
    return !this.activationSuccess && !this.emailConfirmationSuccess;
  }

  private readonly destroyed$ = new Subject<void>();

  constructor(public constants: Constants,
              public messages: TextMessages,
              public route: ActivatedRoute,
              public activationService: ActivationService,
              public securityService: SecurityService,
              private dialog: MatDialog) {

    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {

      params['token'] ? this.token = params['token'] : this.token = "";
      this.activationCustomerModel.token = this.token;

      let mode = params['mode'];

        switch (mode) {
          case 'password':
            this.checkToken(this.token);
            this.step = 1;
            break;
          case 'email':
            this.step = 2;
            delete this.activationCustomerModel.password ;
            this.confirmEmail(this.activationCustomerModel);
            break;
          case 'activation':
            this.step = 2;
            delete this.activationCustomerModel.password;
            this.activateUser(this.activationCustomerModel);
        }

    });

  }

  checkToken(token) {
    this.processing = true;
    this.activationService.checkToken({token: token})
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
      (response) => {
        this.processing = false;
      }, err => {
        console.error(err);
        this.processing = false;
        this.step = 2;
      }
    )

  }

  activateUser(activationCustomerModel: ActivationCustomerModel) {
    this.processing = true;
    this.activationService.activateUser(activationCustomerModel)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        response => {
          this.step = 2;
          this.activationSuccess = true;
          this.securityService.logoutFrontend();
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true)
        },
        err => {
          console.error(err);
          this.confirmationErrorMessage = getErrorMessage(err);
          this.step = 2;
          this.activationSuccess = false;
          this.processing = false;
        });
  }

  confirmEmail(activationCustomerModel: ActivationCustomerModel) {
    this.processing = true;
    this.activationService.confirmUserEmail(activationCustomerModel)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        response => {
          this.step = 2;
          this.emailConfirmationSuccess = true;
          this.securityService.logoutFrontend();
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true)
        },
        err => {
          console.error(err);
          this.confirmationErrorMessage = getErrorMessage(err);
          this.step = 2;
          this.emailConfirmationSuccess = false;
          this.processing = false;
        });
  }

  onSubmit() {
    let activation =  { ...this.activationCustomerModel };
    this.activateUser(activation)
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}



