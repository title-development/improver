import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionaryControlService } from '../../../../../api/services/questionary-control.service';
import { RequestOrder } from '../../../../../model/order-model';
import { Constants } from '../../../../../util/constants';
import { TextMessages } from '../../../../../util/text-messages';
import { MatDialog } from '@angular/material/dialog';
import { Credentials, LoginModel, RegistrationUserModel, Role } from '../../../../../model/security-model';
import { SecurityService } from '../../../../../auth/security.service';
import { ProjectService } from '../../../../../api/services/project.service';
import { OrderValidationResult } from '../../../../../api/models/LocationsValidation';
import { LocationValidateService } from '../../../../../api/services/location-validate.service';
import { PopUpMessageService } from '../../../../../api/services/pop-up-message.service';
import { Router } from '@angular/router';
import { ProjectActionService } from '../../../../../api/services/project-action.service';
import { getErrorMessage, markAsTouched } from '../../../../../util/functions';
import { finalize, first } from "rxjs/internal/operators";
import { UserService } from "../../../../../api/services/user.service";
import { AccountService } from "../../../../../api/services/account.service";
import { TradeService } from "../../../../../api/services/trade.service";
import { MetricsEventService } from "../../../../../api/services/metrics-event.service";
import { takeUntil } from "rxjs/operators";
import { SystemMessageType, UserAddress } from "../../../../../model/data-model";
import { Subject } from "rxjs";
import { RecaptchaComponent } from "ng-recaptcha";
import { CaptchaTrackingService } from "../../../../../api/services/captcha-tracking.service";
import { RegistrationHelper } from "../../../../../util/helpers/registration-helper";
import { DeviceControlService } from "../../../../../api/services/device-control.service";
import { RegistrationService } from "../../../../../api/services/registration.service";
import { UserAddressService } from "../../../../../api/services/user-address.service";
import { MediaQuery, MediaQueryService } from "../../../../../api/services/media-query.service";

@Component({
  selector: 'default-questionary-block',
  templateUrl: './default-questionary-block.component.html',
  styleUrls: ['./default-questionary-block.component.scss'],
})

export class DefaultQuestionaryBlockComponent implements OnInit {

  private readonly destroyed$ = new Subject<void>();

  startExpectationOptions = [
    "I'm flexible",
    "Within 48 hours",
    "Within a week",
    "Within a month",
    "Within a year",
  ];

  media: MediaQuery;

  Role = Role;
  defaultQuestionaryForm;
  emailIsUnique;
  emailIsChecked = false;
  emailIsChecking = false;
  filteredStates = [];
  locationValidation: string = '';
  validationMessage: string = '';
  orderServiceType: string;
  processingAddressValidation: boolean;
  waitingPhoneConfirmation: boolean;
  originalAddress: any = {};
  suggestedAddress: any = {};
  isAddressManual: boolean = false;
  locationInvalid: boolean;
  phoneValid: boolean;
  hideNextAction: boolean;
  disabledNextAction: boolean;
  postOrderProcessing = false;
  nextStepFn: Function;
  currentQuestionName;
  questionaryAnswers;
  loginProcessing = false
  registrationProcessing = false
  loginMessageText;
  loginMessageType;
  showLoginMessage = false;
  userAddresses: UserAddress[] = [];
  loadingUserAddresses: boolean = false;
  canEnterManualAddress: boolean = false;
  isAddressSelected: boolean = false;

  socialButtonsMessageType
  socialButtonsMessageText
  socialButtonsShowMessage

  @ViewChild(RecaptchaComponent, { static: false }) captcha: RecaptchaComponent;

  constructor(public questionaryControlService: QuestionaryControlService,
              public projectService: ProjectService,
              public tradeService: TradeService,
              public projectActionService: ProjectActionService,
              public securityService: SecurityService,
              public userService: UserService,
              public userAddressService: UserAddressService,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: TextMessages,
              public popUpMessageService: PopUpMessageService,
              public captchaTrackingService: CaptchaTrackingService,
              public deviceControlService: DeviceControlService,
              private accountService: AccountService,
              private router: Router,
              private locationValidate: LocationValidateService,
              private metricsEventService: MetricsEventService,
              private registrationService: RegistrationService,
              private registrationHelper: RegistrationHelper,
              public mediaQueryService: MediaQueryService) {
    this.constants = constants;
    this.messages = messages;
    this.emailIsChecked = false;
    this.filteredStates = constants.states;

    securityService.onUserInit.subscribe(() => {
      this.loginProcessing = false;
      this.phoneValid = false;
      if (this.userAddresses.length == 0) {
        this.loadUserAddress();
      }
    });

    if (securityService.isAuthenticated()) {
      this.loadUserAddress();
    }

    this.mediaQueryService.screen
      .subscribe(mediaQuery => this.media = mediaQuery);
  }

  submitUserInfo() {
    if (this.securityService.hasRole(Role.ANONYMOUS) && !this.emailIsChecked) {
      this.checkEmail(this.defaultQuestionaryForm.get('customerPersonalInfo.email').value)
    } else if (this.securityService.hasRole(Role.ANONYMOUS) && this.emailIsChecked && !this.emailIsUnique){
      this.authorize()
    } else if ((this.securityService.hasRole(Role.CUSTOMER) || this.emailIsChecked && this.emailIsUnique) && this.personalInfoRequired()) {
      this.nextQuestion('customerPersonalInfo', !this.questionaryControlService.customerHasPhone && !this.phoneValid ? this.validatePhone : undefined)
    }
  }

  ngOnInit(): void {
    this.defaultQuestionaryForm = this.questionaryControlService.mainForm.get('defaultQuestionaryGroup');
  }

  isValid(name) {
    return this.defaultQuestionaryForm.get(name).valid;
  }

  nextQuestion(name, handler?: Function) {
    this.currentQuestionName = name;

    if (name == 'projectImages') {
      this.nextStep();
      return
    }

    if (this.isValid(name)) {
      if (handler !== undefined) {
        handler.call(this, name, this.nextStep);
      } else {
        this.nextStep();
      }
    } else {
      markAsTouched(<FormGroup> this.defaultQuestionaryForm.get(name));
    }
  }


  close(): void {
    this.dialog.closeAll();
  }

  loadUserAddress() {
    this.loadingUserAddresses = true;
    this.userAddressService.getUserAddress()
      .pipe(finalize(() => this.loadingUserAddresses = false))
      .subscribe((userAddress: UserAddress[]) => {
      this.userAddresses = userAddress;
    }, error => console.log(error))
  }

  checkEmail(email) {
    if(this.defaultQuestionaryForm.get('customerPersonalInfo.email').invalid) {
      this.defaultQuestionaryForm.get('customerPersonalInfo.email').markAsTouched();
      return
    }

    this.emailIsChecking = true;
    this.resetCaptcha()
    // TODO: change this
      this.userService.isEmailFree(email)
        .pipe(finalize(() => {
          this.emailIsChecked = true
          this.emailIsChecking = false;
        }))
        .subscribe(() => {
          this.emailIsUnique = true;
        }, error => {
          console.log(error)
          if (error.status == 409) {
            this.emailIsUnique = false;
          } else {
            this.popUpMessageService.showError(getErrorMessage(error))
          }
        });
  }


  onSubmit(): void {
    this.disabledNextAction = true;
    let projectId = this.questionaryControlService.projectId;
    if (projectId) {
      this.metricsEventService.fireProjectRequestedEvent();
      this.projectService.submitProject(projectId)
        .subscribe(response => {
          this.questionaryControlService.projectId = null;
          this.postOrderProcessing = false;
          this.projectActionService.projectUpdated();
          this.dialog.closeAll();
          this.router.navigate(['my', 'projects', projectId]);
          this.popUpMessageService.showSuccess(this.orderServiceType + ' request is submitted');
          if (!this.securityService.getLoginModel().emailConfirmed) {
            this.registrationHelper.email = this.defaultQuestionaryForm.get('customerPersonalInfo.email').value;
            this.registrationHelper.isRegisteredWhileProjectSubmission = true;
            setTimeout(() => {
              this.registrationHelper.openEmailVerificationHintDialog()
            }, 200)
          }
        });
    }
  }

  nextStep(incrementIndex = 1): void {
    if (this.questionaryControlService.currentQuestionIndex + incrementIndex
      <
      this.questionaryControlService.questionaryLength + this.questionaryControlService.defaultQuestionaryLength) {
      this.questionaryControlService.currentQuestionIndex += incrementIndex;
    }
  }

  /**
   * Location
   */

  autocompleteStateSearch(search): void {
    if (search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str as string)));
    } else {
      this.filteredStates = this.constants.states;
    }
  }

  validateLocation(formGroupName: string, callback?: Function): void {
    if (this.questionaryControlService.hasUnsavedChanges) {
      this.disabledNextAction = true;
      this.postOrderProcessing = true;
      const location = this.defaultQuestionaryForm.get(formGroupName).value;
      const requestOrder = RequestOrder.build(this.questionaryControlService.mainForm.getRawValue(),
        this.questionaryControlService.questionary.questions, this.questionaryControlService.serviceType, this.isAddressManual);
      this.orderServiceType = requestOrder.serviceName;
      this.questionaryAnswers = requestOrder.questionary;
      if (this.questionaryControlService.projectId){
        requestOrder.projectId = this.questionaryControlService.projectId;
      }
      this.projectService.prepareOrder(requestOrder)
        .pipe(finalize(() => {
          this.postOrderProcessing = false;
          this.processingAddressValidation = false;
        }))
        .subscribe((orderValidationResult: OrderValidationResult) => {
          this.questionaryControlService.projectId = orderValidationResult.projectId;
          this.questionaryControlService.hasUnsavedChanges = false;

          if (orderValidationResult.validatedLocation.valid) {
            this.locationValidation = '';
            this.disabledNextAction = false;
            callback.call(this);
          } else {
            if (orderValidationResult.validatedLocation.suggested) {
              this.hideNextAction = true;
              this.locationInvalid = true;
              this.originalAddress = location;
              this.originalAddress.canUseManual = orderValidationResult.validatedLocation.canUseManual;
              this.suggestedAddress = orderValidationResult.validatedLocation.suggested;
              this.validationMessage = orderValidationResult.validatedLocation.validationMsg;
            } else {
              this.locationInvalid = false;
              this.disabledNextAction = true;
            }
            this.locationValidation = orderValidationResult.validatedLocation.error;
            this.defaultQuestionaryForm.get('projectLocation')
              .valueChanges
              .pipe(first())
              .subscribe(res => {
                  this.locationValidation = '';
                  this.disabledNextAction = false;
                }
              );
          }
        }, err => {
          console.error(err);
          this.locationValidation = 'Address Not found';
          this.resetLocationQuestion();
          this.disabledNextAction = false;
        });
    } else {
      callback.call(this);
    }

  }

  resetLocationQuestion(): void {
    this.locationInvalid = false;
    this.hideNextAction = false;
    this.disabledNextAction = true;
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
  }

  selectAddress(address, isAddressManual: boolean) {
    this.isAddressSelected = true;
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    this.isAddressManual = isAddressManual;
    location.setValue({
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zip: address.zip
    });
  }

  clearUserAddressForm() {
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    this.canEnterManualAddress = true;
    this.isAddressSelected = false;
    location.reset({
      'zip': location.get('zip').value,
    });
  }

  chooseAddress(address: any, isAddressManual: boolean): void {
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    this.isAddressManual = isAddressManual;
    this.processingAddressValidation = true;
    this.hideNextAction = false;
    this.locationInvalid = false;
    this.locationValidation = '';
    location.setValue({
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zip: address.zip
    });
    if (this.securityService.hasRole(Role.ANONYMOUS)) {
      this.nextQuestion('projectLocation', this.validateLocation);
    } else if (this.securityService.hasRole(Role.CUSTOMER) && !this.questionaryControlService.customerHasPhone) {
      this.nextQuestion('projectLocation', this.validateLocation);
    } else {
      this.nextQuestion('projectLocation', this.validateLocation);
    }

  }

  validatePhone(formGroupName: string, callback?: Function) {
    this.nextStepFn = callback;
    this.disabledNextAction = true;
    this.waitingPhoneConfirmation = true;
  }

  editPhoneAgain() {
    this.nextStepFn = null;
    this.disabledNextAction = false;
    this.waitingPhoneConfirmation = false;
  }

  onPhoneValidated() {
    this.disabledNextAction = false;
    this.waitingPhoneConfirmation = false;
    this.phoneValid = true;
    this.questionaryControlService.updateQuestionaryParams(undefined, true)

    if(!this.securityService.isAuthenticated()) {
      this.authorize()
    }

  }

  personalInfoRequired() {
    return (this.securityService.hasRole(Role.ANONYMOUS) || (this.securityService.hasRole(Role.CUSTOMER) && !this.questionaryControlService.customerHasPhone))
  }

  authorize() {
    if (this.captcha) {
      this.captcha.execute()
    } else {
      this.handleAnonymousUser();
    }

    if(this.emailIsChecked && !this.emailIsUnique) {
      this.loginProcessing = true;
    } else {
      this.registrationProcessing = true;
    }

    if (this.captcha) {
      this.captchaTrackingService.captchaDialogChange().subscribe( () => {
        this.resetCaptcha()
        this.loginProcessing = false;
        this.registrationProcessing = false;
      })
    } else {
      this.loginProcessing = false;
      this.registrationProcessing = false;
    }

  }

  resolveCaptcha(captcha) {
    if(captcha) {
      this.handleAnonymousUser(captcha)
    } else {
      this.loginProcessing = false;
      this.registrationProcessing = false
    }
  }

  handleAnonymousUser(captcha?) {
    if(this.emailIsChecked && this.emailIsUnique) {
      this.register(captcha)
    } else {
      this.loginCustomer(captcha);
    }
  }

  loginCustomer(captcha?) {
    let credentials = new Credentials(this.defaultQuestionaryForm.get('customerPersonalInfo.email').value, this.defaultQuestionaryForm.get('customerPersonalInfo.password').value, captcha);
    this.loginProcessing = true;
    this.securityService.sendLoginRequest(credentials)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.resetCaptcha())
      )
      .subscribe(response => {
        let loginModel: LoginModel = response.body as LoginModel;

        if (loginModel.role != Role.CUSTOMER) {
          this.securityService.cleanUserLoginData();
          this.showLoginResponseMessage('Only customers can request a project', SystemMessageType.ERROR);
          return;
        }

        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
        this.phoneValid = false;
        this.questionaryControlService.customerHasPhone = false;
        this.defaultQuestionaryForm.get('customerPersonalInfo.password').value = '';
        this.questionaryControlService.onAccountDataLoaded
          .pipe(first(), finalize(() => { this.loginProcessing = false; }))
          .subscribe(account => {
        })

      }, err => {
        if (err.status == 401) {
          this.securityService.logoutFrontend();
        }
        this.showLoginResponseMessage(getErrorMessage(err), SystemMessageType.ERROR);
        this.loginProcessing = false;
        this.resetCaptcha();
      })
  }

  register(captcha?) {
    let registrationUserModel: RegistrationUserModel = new RegistrationUserModel();
    registrationUserModel.captcha = captcha;
    registrationUserModel.email = this.defaultQuestionaryForm.get('customerPersonalInfo.email').value
    registrationUserModel.firstName = this.defaultQuestionaryForm.get('customerPersonalInfo.firstName').value
    registrationUserModel.lastName = this.defaultQuestionaryForm.get('customerPersonalInfo.lastName').value
    registrationUserModel.phone = this.defaultQuestionaryForm.get('customerPersonalInfo.phone').value
    registrationUserModel.preventConfirmationEmail = true;

    this.registrationProcessing = true;
    this.registrationService.registerCustomer(registrationUserModel)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.resetCaptcha())
      )
      .subscribe(response => {
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
        this.phoneValid = true;
        this.questionaryControlService.customerHasPhone = true;
        this.registrationProcessing = false;
      }, error => {
        this.popUpMessageService.showError(getErrorMessage(error))
        this.resetCaptcha();
      })
  }

  showLoginResponseMessage(messageText, messageType) {
    this.loginMessageText = messageText;
    this.loginMessageType = messageType;
    this.showLoginMessage = true;
  }

  onLoginMessageHide(event) {
    this.showLoginMessage = event;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.resetCaptcha();
  }

  resetCaptcha() {
    if (this.captcha) {
      this.captcha.reset()
    }
  }

  onSocialButtonsMessageHide(event) {
    this.socialButtonsShowMessage = event;
  }

}
