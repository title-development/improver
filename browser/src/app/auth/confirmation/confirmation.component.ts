import { Component, OnDestroy } from '@angular/core';
import { Constants } from '../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { ActivationCustomerModel, LoginModel } from '../../model/security-model';
import { ActivationService } from '../../api/services/activation.service';
import { Messages } from '../../util/messages';
import { SecurityService } from '../security.service';
import { getErrorMessage } from '../../util/functions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IInfoWindowDialogData, InfoWindowDialogComponent } from '../../shared/dialogs/info-window-dialog';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
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
  password: {
    confirm: ""
  };
  activationSuccess = false;
  emailConfirmationSuccess = false;
  confirmationErrorMessage: string;
  processing = false;

  get isConfirmationError(): boolean {
    return !(this.activationSuccess && this.emailConfirmationSuccess);
  }

  private readonly destroyed$ = new Subject<void>();

  constructor(public constants: Constants,
              public messages: Messages,
              public route: ActivatedRoute,
              public activationService: ActivationService,
              public securityService: SecurityService,
              private dialog: MatDialog) {

    if (this.securityService.isAuthenticated()) {
      this.securityService.systemLogout();
    }

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
        console.log(err);
        this.processing = false;
        this.step = 2;
      }
    )

  }

  activateUser(activationCustomerModel:any) {
    this.processing = true;
    this.activationService.activateUser(activationCustomerModel)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        response => {
          this.step = 2;
          this.activationSuccess = true;
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true)
            .then(() => this.openSuccessDialog('Thank you for choosing Home Improve!'))
        },
        err => {
          console.log(err);
          this.confirmationErrorMessage = getErrorMessage(err);
          this.step = 2;
          this.activationSuccess = false;
          this.processing = false;
        });
  }

  confirmEmail(activationCustomerModel:any) {
    this.processing = true;
    this.activationService.confirmUserEmail(activationCustomerModel)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        response => {
          this.step = 2;
          this.emailConfirmationSuccess = true;
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true)
            .then(()=> this.openSuccessDialog('Email confirmed'))
        },
        err => {
          console.log(err);
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

  private openSuccessDialog(message: string): void {
    this.dialog.open<InfoWindowDialogComponent, IInfoWindowDialogData>
    (dialogsMap['info-window-dialog'], {
      minWidth: 460,
      panelClass: 'dialog-fix-position',
      data: {
        message: message,
        buttonTitle: 'OK',
        iconUrl: 'assets/img/round-icons/confirmation-envelope.png'
      }
    });
  }

}



