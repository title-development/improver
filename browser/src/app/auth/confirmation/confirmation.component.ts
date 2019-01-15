import { Component } from '@angular/core';
import { Constants } from "../../util/constants";
import { ActivatedRoute } from "@angular/router";
import { ActivationCustomerModel, LoginModel } from "../../model/security-model";
import { ActivationService } from '../../api/services/activation.service';
import { Messages } from "../../util/messages";
import { SecurityService } from "../security.service";
import { getErrorMessage } from "../../util/functions";
import { Role } from "../../model/security-model";

@Component({
  selector: 'confirmation-page',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})

export class ConfirmationComponent {

  Role = Role;
  step = 2;
  private sub: any;
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
  confirmationProcessing = false;

  constructor(public constants: Constants,
              public messages: Messages,
              public route: ActivatedRoute,
              public activationService: ActivationService,
              public securityService: SecurityService) {

    if (this.securityService.isAuthenticated()) {
      this.securityService.systemLogout();
    }

    this.sub = this.route.params.subscribe(params => {

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
            this.activateCustomer(this.activationCustomerModel);
        }

    });

  }

  checkToken(token) {
    this.confirmationProcessing = true;
    this.activationService.checkToken({token: token}).subscribe(
      (response) => {
        this.confirmationProcessing = false;
      }, err => {
        console.log(err);
        this.confirmationProcessing = false;
        this.step = 2;
      }
    )

  }

  activateCustomer(activationCustomerModel:any) {
    this.confirmationProcessing = true;
    this.activationService.activateUser(activationCustomerModel)
      .subscribe(
        response => {
          this.step = 2;
          this.activationSuccess = true;
          this.confirmationProcessing = false;
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
        },
        err => {
          console.log(err);
          this.confirmationErrorMessage = getErrorMessage(err);
          this.step = 2;
          this.activationSuccess = false;
          this.confirmationProcessing = false;
        });
  }

  confirmEmail(activationCustomerModel:any) {
    this.confirmationProcessing = true;
    this.activationService.confirmUserEmail(activationCustomerModel)
      .subscribe(
        response => {
          this.step = 2;
          this.emailConfirmationSuccess = true;
          this.confirmationProcessing = false;
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
        },
        err => {
          console.log(err);
          this.confirmationErrorMessage = getErrorMessage(err);
          this.step = 2;
          this.emailConfirmationSuccess = false;
          this.confirmationProcessing = false;
        });
  }

  onSubmit() {
    let activation =  { ...this.activationCustomerModel };
    this.activateCustomer(activation)
  }

}



