import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionaryControlService } from '../../../../../util/questionary-control.service';
import { RequestOrder } from '../../../../../model/order-model';
import { Constants } from '../../../../../util/constants';
import { Messages } from '../../../../../util/messages';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../../../model/security-model';
import { SecurityService } from '../../../../../auth/security.service';
import { ProjectService } from '../../../../../api/services/project.service';
import { ValidatedLocation } from '../../../../../api/models/LocationsValidation';
import { LocationValidateService } from '../../../../../api/services/location-validate.service';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { Router } from '@angular/router';
import { ProjectActionService } from '../../../../../util/project-action.service';
import { capitalize, getErrorMessage, markAsTouched } from '../../../../../util/functions';
import { finalize, first } from "rxjs/internal/operators";
import { UserService } from "../../../../../api/services/user.service";
import { AccountService } from "../../../../../api/services/account.service";
import { TradeService } from "../../../../../api/services/trade.service";
import { MetricsEventService } from "../../../../../util/metrics-event.service";

@Component({
  selector: 'default-questionary-block',
  templateUrl: './default-questionary-block.component.html',
  styleUrls: ['./default-questionary-block.component.scss'],
})

export class DefaultQuestionaryBlockComponent implements OnInit {

  startExpectationOptions = [
    "I'm flexible",
    "Within 48 hours",
    "Within a week",
    "Within a month",
    "Within a year",
  ];

  Role = Role;
  defaultQuestionaryForm;
  emailIsUnique;
  emailIsChecked = false;
  filteredStates = [];
  locationValidation: string = '';
  validationMessage: string = '';
  processingAddressValidation: boolean;
  processingPhoneValidation: boolean;
  originalAddress: any = {};
  suggestedAddress: any = {};
  locationInvalid: boolean;
  phoneValid: boolean;
  hideNextAction: boolean;
  disabledNextAction: boolean;
  postOrderProcessing = false;
  nextStepFn: Function;
  currentQuestionName;
  questionaryAnswers;

  @ViewChildren('defaultQuestion') defaultQuestions: QueryList<ElementRef>;

  constructor(public questionaryControlService: QuestionaryControlService,
              public projectService: ProjectService,
              public tradeService: TradeService,
              public projectActionService: ProjectActionService,
              public securityService: SecurityService,
              public userService: UserService,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,
              public popUpMessageService: PopUpMessageService,
              private accountService: AccountService,
              private router: Router,
              private locationValidate: LocationValidateService,
              private metricsEventService: MetricsEventService) {
    this.constants = constants;
    this.messages = messages;
    this.emailIsChecked = false;
    this.filteredStates = constants.states;
  }

  ngOnInit(): void {
    this.defaultQuestionaryForm = this.questionaryControlService.mainForm.get('defaultQuestionaryGroup');
  }

  isValid(name) {
    return this.defaultQuestionaryForm.get(name).valid;
  }

  nextQuestion(name, handler?: Function) {
    this.currentQuestionName = name;

    if(name == 'customerPersonalInfo') {
      this.getQuestionaryAnswers();
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

  onSubmit(name?, handler?: Function): void {
    if (name) {
      if (this.isValid(name)) {
        if (handler !== undefined) {
          handler.call(this, name, this.saveProject);
        } else {
          this.saveProject();
        }
      } else {
        markAsTouched(<FormGroup> this.defaultQuestionaryForm.get(name));
      }
    } else {
      this.saveProject();
    }
  }

  close(): void {
    this.dialog.closeAll();
  }

  checkEmail(email) {
    if (email){
      this.emailIsUnique = true;
      this.emailIsChecked = false;

      this.userService.isEmailFree(email)
        .pipe(finalize(() => this.emailIsChecked = true))
        .subscribe(() => {
        }, () => {
          this.emailIsUnique = false;
          this.saveProjectToStorage();
        });
    }
  }

  saveProjectToStorage() {
    let requestOrder = RequestOrder.build(this.questionaryControlService.mainForm.getRawValue(), this.questionaryControlService.serviceType);
    let unsavedProjects = {};
    let date = new Date().toISOString();
    unsavedProjects[date] = requestOrder;
    localStorage.setItem('unsavedProjects', JSON.stringify(unsavedProjects));
  }

  saveProject(): void {
    this.disabledNextAction = true;
    const requestOrder = RequestOrder.build(this.questionaryControlService.mainForm.getRawValue(), this.questionaryControlService.serviceType);
    this.postOrderProcessing = true;
      this.projectService.postOrder(requestOrder).subscribe(
        result => {
          this.orderSuccess(requestOrder);
          this.metricsEventService.fireProjectRequestedEvent();
        },
        err => {
          this.popUpMessageService.showError(getErrorMessage(err));
          this.postOrderProcessing = false;
        }
      );
  }

  orderSuccess(requestOrder: RequestOrder): void {
    this.postOrderProcessing = false;
    this.projectActionService.projectUpdated();
    this.dialog.closeAll();
    if (this.securityService.isAuthenticated()) {
      this.router.navigate(['my','projects']);
      this.popUpMessageService.showSuccess('Your <b>' + requestOrder.serviceName + '</b> request is submitted successfully!');
    } else {
      this.popUpMessageService.showSuccess('Your <b>' + requestOrder.serviceName + '</b> request is saved. Please check your email.');
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
    this.disabledNextAction = true;
    const location = this.defaultQuestionaryForm.get(formGroupName).value;
    this.processingAddressValidation = true;
    this.locationValidate.validateWithCoverage(location)
      .pipe(first())
      .subscribe((validatedLocation: ValidatedLocation) => {
      this.processingAddressValidation = false;
      if (validatedLocation.valid) {
        this.locationValidation = '';
        this.disabledNextAction = false;
        callback.call(this);
      } else {
        if (validatedLocation.suggested) {
          this.hideNextAction = true;
          this.locationInvalid = true;
          this.originalAddress = location;
          this.suggestedAddress = validatedLocation.suggested;
          this.validationMessage = validatedLocation.validationMsg;
        } else {
          this.locationInvalid = false;
        }
        this.locationValidation = validatedLocation.error;
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
        console.error(err)
      this.processingAddressValidation = false;
      this.locationValidation = 'Address Not found';
      this.resetLocationQuestion();
    });
  }

  resetLocationQuestion(): void {
    this.locationInvalid = false;
    this.hideNextAction = false;
    this.disabledNextAction = false;
    this.locationValidation = '';
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
  }

  chooseAddress(address: any): void {
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
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
      this.nextStep();
    } else if (this.securityService.hasRole(Role.CUSTOMER) && !this.questionaryControlService.customerHasPhone) {
      this.nextStep();
    } else {
      this.nextStep();
    }

  }

  validatePhone(formGroupName: string, callback?: Function) {
    this.nextStepFn = callback;
    this.disabledNextAction = true;
    this.processingPhoneValidation = true;
  }

  editPhoneAgain() {
    this.nextStepFn = null;
    this.disabledNextAction = false;
    this.processingPhoneValidation = false;
  }

  onPhoneValidated() {
    this.disabledNextAction = false;
    this.processingPhoneValidation = false;
    this.phoneValid = true;
    this.nextStepFn.call(this)
  }

  personalInfoRequired() {
    return (this.securityService.hasRole(Role.ANONYMOUS)  || (this.securityService.hasRole(Role.CUSTOMER) && !this.questionaryControlService.customerHasPhone))
  }

  getQuestionaryAnswers() {
    let questionaryAnswers = [];
    for (const field in this.questionaryControlService.mainForm.get('questionaryGroup').controls) { // 'field' is a string
      let control = this.questionaryControlService.mainForm.get('questionaryGroup').get(field); // 'control' is a FormControl
      let key: any = field.split('_');
      key.shift()
      key = capitalize(key.join(' '));
      let value = control.value;
      if(!Array.isArray(value)) {
        value = [value]
      }
      questionaryAnswers.push({key: key, value: value})
    }
    this.questionaryAnswers = questionaryAnswers
    return questionaryAnswers;
  }

}
