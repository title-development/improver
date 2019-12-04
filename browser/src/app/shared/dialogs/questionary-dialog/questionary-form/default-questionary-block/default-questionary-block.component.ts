import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionaryBlock } from '../../../../../model/questionary-model';
import { QuestionaryControlService } from '../../../../../util/questionary-control.service';
import { ServiceType } from '../../../../../model/data-model';
import { RequestOrder } from '../../../../../model/order-model';
import { Constants } from '../../../../../util/constants';
import { Messages } from '../../../../../util/messages';
import { MatDialog } from '@angular/material';
import { Role } from '../../../../../model/security-model';
import { SecurityService } from '../../../../../auth/security.service';
import { ProjectService } from '../../../../../api/services/project.service';
import { ValidatedLocation } from '../../../../../api/models/LocationsValidation';
import { LocationValidateService } from '../../../../../api/services/location-validate.service';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { Router } from '@angular/router';
import { ProjectActionService } from '../../../../../util/project-action.service';
import { getErrorMessage, markAsTouched } from '../../../../../util/functions';
import { CompanyService } from '../../../../../api/services/company.service';
import { ErrorHandler } from '../../../../../util/error-handler';
import { finalize, first } from "rxjs/internal/operators";
import { BoundariesService } from "../../../../../api/services/boundaries.service";
import { UserService } from "../../../../../api/services/user.service";
import { AccountService } from "../../../../../api/services/account.service";
import { CustomerSuggestionService } from "../../../../../api/services/customer-suggestion.service";

@Component({
  selector: 'default-questionary-block',
  templateUrl: './default-questionary-block.component.html',
  styleUrls: ['./default-questionary-block.component.scss'],
})

export class DefaultQuestionaryBlockComponent implements OnInit {

  @Input() mainForm: FormGroup;
  @Input() serviceType: ServiceType;
  @Input() questionary: QuestionaryBlock[];
  @Input() companyId: string;
  Role = Role;
  defaultQuestionaryForm;
  emailIsUnique;
  emailIsChecked = false;
  filteredStates = [];
  locationValidation: string = '';
  validationMessage: string = '';
  processingAddressValidation: boolean;
  originalAddress: any = {};
  suggestedAddress: any = {};
  locationInvalid: boolean;
  hideNextAction: boolean;
  disabledNextAction: boolean;
  postOrderProcessing = false;
  lastZipCode: string;

  @ViewChildren('defaultQuestion') defaultQuestions: QueryList<ElementRef>;

  constructor(public questionaryControlService: QuestionaryControlService,
              public projectService: ProjectService,
              public projectActionService: ProjectActionService,
              public securityService: SecurityService,
              public userService: UserService,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,
              public popUpMessageService: PopUpMessageService,
              public customerSuggestionService: CustomerSuggestionService,
              private accountService: AccountService,
              private router: Router,
              private locationValidate: LocationValidateService,
              private companyService: CompanyService,
              private boundariesService: BoundariesService,
              private errorHandler: ErrorHandler) {
    this.constants = constants;
    this.messages = messages;
    this.emailIsChecked = false;
    this.filteredStates = constants.states;

    this.lastZipCode = localStorage.getItem('zipCode');

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );
  }

  ngOnInit(): void {
    this.defaultQuestionaryForm = this.mainForm.get('defaultQuestionaryGroup');
  }

  isValid(name) {
    return this.defaultQuestionaryForm.get(name).valid;
  }

  getLastCustomerZipCode() {
    if (this.securityService.hasRole(Role.CUSTOMER) || this.securityService.hasRole(Role.ANONYMOUS)) {
      this.customerSuggestionService.lastCustomerZipCode$
        .subscribe(
          zipCode => this.lastZipCode = zipCode
        )
    }
  }

  nextQuestion(name, handler: () => {} = undefined) {

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

  previousQuestion(handler: () => {} = undefined) {
    console.log('previousQuestion');

    if (handler !== undefined) {
      handler.call(this);
    }
    if (this.questionaryControlService.currentQuestionIndex > -1) {
      this.questionaryControlService.currentQuestionIndex--;
    }
  }


  onSubmit(name?, handler: () => {} = undefined): void {
    if (name) {
      if (this.isValid(name)) {
        console.log('valid');
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
    let requestOrder = RequestOrder.build(this.mainForm.getRawValue(), this.serviceType);
    let unsavedProjects = {};
    let date = new Date().toISOString();
    unsavedProjects[date] = requestOrder;
    localStorage.setItem('unsavedProjects', JSON.stringify(unsavedProjects));
  }

  saveProject(): void {
    this.disabledNextAction = true;
    const requestOrder = RequestOrder.build(this.mainForm.getRawValue(), this.serviceType);
    this.postOrderProcessing = true;
    if (this.companyId) {
      this.companyService.postOrder(requestOrder, this.companyId).subscribe(
        result => this.orderSuccess(requestOrder),
        err => {
          this.postOrderProcessing = false;
        }
      );
    } else {
      this.projectService.postOrder(requestOrder).subscribe(
        result => this.orderSuccess(requestOrder),
        err => {
          this.popUpMessageService.showError(getErrorMessage(err));
          this.postOrderProcessing = false;
        }
      );
    }
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

  nextStep(): void {
    if (this.questionaryControlService.currentQuestionIndex
      <
      this.questionaryControlService.questionaryLength - 1 + this.questionaryControlService.defaultQuestionaryLength) {
      this.questionaryControlService.currentQuestionIndex++;
    }
  }

  /**
   * Location
   */

  autocompleteSearch(search): void {
    if (search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str as string)));
    } else {
      this.filteredStates = this.constants.states;
    }
  }

  validateLocation(formGroupName: string, callback: () => {}): void {
    this.disabledNextAction = true;
    const location = this.defaultQuestionaryForm.get(formGroupName).value;
    this.processingAddressValidation = true;
    this.locationValidate.validateWithCoverage(location).pipe(
      first()
    ).subscribe((validatedLocation: ValidatedLocation) => {
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
    }, error => {
      this.processingAddressValidation = false;
      this.locationValidation = 'Address Not found';
    });
  }

  resetLocationQuestion(): void {
    this.locationInvalid = false;
    this.hideNextAction = false;
    this.disabledNextAction = true;
    const location: FormGroup = this.defaultQuestionaryForm.get('projectLocation');
    location.valueChanges.pipe(
      first()
    ).subscribe(res => {
        this.locationValidation = '';
        this.disabledNextAction = false;
      }
    );
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
      this.saveProject();
    }

  }

  submitZip() {
    console.log(this.defaultQuestionaryForm.get('projectLocation.zip'));
    this.projectActionService.zipIsChecking = true;
    this.boundariesService.isZipSupported(this.defaultQuestionaryForm.get('projectLocation.zip').value).subscribe(
      supported => {
        this.projectActionService.zipIsChecking = false;
        this.projectActionService.zipIsSupported = supported;
        if (supported) {
          this.customerSuggestionService.saveUserSearchTerm(this.serviceType.name, this.defaultQuestionaryForm.get('projectLocation.zip').value, false);
          this.nextStep();
        }
      },
      error => {
        this.projectActionService.zipIsChecking = false;
        console.log(error)
      }
    );

  }

}
