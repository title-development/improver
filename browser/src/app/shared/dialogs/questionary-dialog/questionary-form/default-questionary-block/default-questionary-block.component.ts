import { ChangeDetectorRef, OnDestroy, Component, OnInit, ViewChild } from '@angular/core';
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

type NextStepFn = (incrementIndex?: number) => void;
type NextQuestionHandlerFn = (name: string, nextStepFn: NextStepFn) => void;

@Component({
  selector: 'default-questionary-block',
  templateUrl: './default-questionary-block.component.html',
  styleUrls: ['./default-questionary-block.component.scss'],
})
export class DefaultQuestionaryBlockComponent implements OnInit, OnDestroy {

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
  hasLocationInvalidMessage: boolean;
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
  selectedUserAddress: UserAddress;
  isLocationValid: boolean;

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
              private changeDetectorRef: ChangeDetectorRef,
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

    this.securityService.onUserInit
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.loadUserAddress());

    this.mediaQueryService.screen
      .subscribe(mediaQuery => this.media = mediaQuery);
  }

  submitUserInfo(): void {
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

  isValid(formControlName: string): boolean {
    return this.defaultQuestionaryForm.get(formControlName).valid;
  }

  nextQuestion(formControlName: string, handler?: NextQuestionHandlerFn): void {
    this.currentQuestionName = formControlName;

    if (formControlName == 'projectImages') {
      this.nextStep();
      return
    }

    if (this.isValid(formControlName)) {
      if (handler !== undefined) {
        handler.call(this, formControlName, this.nextStep);
      } else {
        this.nextStep();
      }
    } else {
      markAsTouched(<FormGroup> this.defaultQuestionaryForm.get(formControlName));
    }
  }


  close(): void {
    this.dialog.closeAll();
  }

  loadUserAddress(): void {
    this.loadingUserAddresses = true;
    this.userAddressService.getUserAddress()
      .pipe(finalize(() => this.loadingUserAddresses = false))
      .subscribe((userAddresses: UserAddress[]) => {
        this.userAddresses = userAddresses;
        if (userAddresses && userAddresses.length > 0) {
          this.selectAddress(userAddresses[0], false)
        }
      }, error => console.log(error))
  }

  hasAddressMatches(selectedUserAddress: UserAddress): boolean {
    let location: UserAddress = this.defaultQuestionaryForm.get('projectLocation').value;
    return location.streetAddress.toLowerCase() == selectedUserAddress.streetAddress.toLowerCase()
      && location.city.toLowerCase() == selectedUserAddress.city.toLowerCase()
      && location.state.toLowerCase() == selectedUserAddress.state.toLowerCase()
      && location.zip.toLowerCase() == selectedUserAddress.zip.toLowerCase();
  }

  checkEmail(email: string): void {
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

  nextStep(incrementIndex: number = 1): void {
    if (this.questionaryControlService.currentQuestionIndex + incrementIndex
      <
      this.questionaryControlService.questionaryLength + this.questionaryControlService.defaultQuestionaryLength) {
      this.questionaryControlService.currentQuestionIndex += incrementIndex;
    }
  }

  /**
   * Location
   */

  autocompleteStateSearch(search: string): void {
    if (search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str as string)));
    } else {
      this.filteredStates = this.constants.states;
    }
  }

  validateLocation(formGroupName: string, nextStepFn: NextStepFn): void {
    // check whether the user's address has changed
    if (this.selectedUserAddress && this.hasAddressMatches(this.selectedUserAddress) && this.isLocationValid) {
      nextStepFn.call(this);
      return;
    }

    if (this.questionaryControlService.hasUnsavedChanges) {
      this.disabledNextAction = true;
      this.postOrderProcessing = true;
      const location = this.defaultQuestionaryForm.get(formGroupName).value;
      this.selectedUserAddress = location;
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
          this.isLocationValid = orderValidationResult.validatedLocation.valid;
          this.questionaryControlService.projectId = orderValidationResult.projectId;
          this.questionaryControlService.hasUnsavedChanges = false;

          if (orderValidationResult.validatedLocation.valid) {
            this.locationValidation = '';
            this.disabledNextAction = false;
            nextStepFn.call(this);
          } else {
            if (orderValidationResult.validatedLocation.suggested) {
              this.hideNextAction = true;
              this.hasLocationInvalidMessage = true;
              this.originalAddress = location;
              this.originalAddress.canUseManual = orderValidationResult.validatedLocation.canUseManual;
              this.suggestedAddress = orderValidationResult.validatedLocation.suggested;
              this.validationMessage = orderValidationResult.validatedLocation.validationMsg;
            } else {
              this.hasLocationInvalidMessage = false;
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
          this.isLocationValid = false;
          this.locationValidation = 'Address Not found';
          this.resetLocationQuestion();
          this.disabledNextAction = false;
        });
    } else {
      nextStepFn.call(this);
    }

  }

  resetLocationQuestion(): void {
    this.hasLocationInvalidMessage = false;
    this.hideNextAction = false;
    this.disabledNextAction = true;
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
  }

  selectAddress(address: UserAddress, isAddressManual: boolean): void {
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

  clearUserAddressForm(): void {
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    this.canEnterManualAddress = true;
    this.isAddressSelected = false;
    this.changeDetectorRef.detectChanges();
    location.reset({
      'zip': location.get('zip').value,
    });
  }

  chooseAddress(address: UserAddress, isAddressManual: boolean): void {
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    this.isAddressManual = isAddressManual;
    this.processingAddressValidation = true;
    this.hideNextAction = false;
    this.hasLocationInvalidMessage = false;
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

  validatePhone(formGroupName: string, callback?: Function): void {
    this.nextStepFn = callback;
    this.disabledNextAction = true;
    this.waitingPhoneConfirmation = true;
  }

  editPhoneAgain(): void {
    this.nextStepFn = null;
    this.disabledNextAction = false;
    this.waitingPhoneConfirmation = false;
  }

  onPhoneValidated(): void {
    this.disabledNextAction = false;
    this.waitingPhoneConfirmation = false;
    this.phoneValid = true;
    this.questionaryControlService.updateQuestionaryParams(undefined, true)

    if(!this.securityService.isAuthenticated()) {
      this.authorize()
    }

  }

  personalInfoRequired(): boolean {
    return (this.securityService.hasRole(Role.ANONYMOUS) || (this.securityService.hasRole(Role.CUSTOMER) && !this.questionaryControlService.customerHasPhone))
  }

  authorize(): void {
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

  resolveCaptcha(captcha): void {
    if(captcha) {
      this.handleAnonymousUser(captcha)
    } else {
      this.loginProcessing = false;
      this.registrationProcessing = false
    }
  }

  handleAnonymousUser(captcha?): void {
    if(this.emailIsChecked && this.emailIsUnique) {
      this.register(captcha)
    } else {
      this.loginCustomer(captcha);
    }
  }

  loginCustomer(captcha?): void {
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

  register(captcha?): void {
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

  showLoginResponseMessage(messageText: string, messageType: any): void {
    this.loginMessageText = messageText;
    this.loginMessageType = messageType;
    this.showLoginMessage = true;
  }

  onLoginMessageHide(event): void {
    this.showLoginMessage = event;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.resetCaptcha();
  }

  resetCaptcha(): void {
    if (this.captcha) {
      this.captcha.reset()
    }
  }

  onSocialButtonsMessageHide(event): void {
    this.socialButtonsShowMessage = event;
  }

}
