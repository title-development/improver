import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { QuestionaryControlService } from '../../../../../util/questionary-control.service';
import { ServiceType } from '../../../../../model/data-model';
import { Constants } from '../../../../../util/constants';
import { Messages } from '../../../../../util/messages';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../../../model/security-model';
import { SecurityService } from '../../../../../auth/security.service';
import { ProjectService } from '../../../../../api/services/project.service';
import { LocationValidateService } from '../../../../../api/services/location-validate.service';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { Router } from '@angular/router';
import { ProjectActionService } from '../../../../../util/project-action.service';
import { CompanyService } from '../../../../../api/services/company.service';
import { ErrorHandler } from '../../../../../util/error-handler';
import { BoundariesService } from "../../../../../api/services/boundaries.service";
import { UserService } from "../../../../../api/services/user.service";
import { AccountService } from "../../../../../api/services/account.service";
import { CustomerSuggestionService } from "../../../../../api/services/customer-suggestion.service";
import { TradeService } from "../../../../../api/services/trade.service";

@Component({
  selector: 'pre-questionary-block',
  templateUrl: './pre-questionary-block.html',
  styleUrls: ['./pre-questionary-block.scss'],
})

export class PreQuestionaryBlock implements OnInit {

  Role = Role;
  defaultQuestionaryForm;
  lastZipCode: string;
  serviceSearch;

  filteredServices: ServiceType[] = [];

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
              public customerSuggestionService: CustomerSuggestionService,
              private accountService: AccountService,
              private router: Router,
              private locationValidate: LocationValidateService,
              private companyService: CompanyService,
              private boundariesService: BoundariesService,
              private errorHandler: ErrorHandler) {
    this.constants = constants;
    this.messages = messages;

    this.lastZipCode = localStorage.getItem('zipCode');

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );

    if (this.questionaryControlService.trade) {
      this.filteredServices = this.questionaryControlService.trade.services;
    }

  }

  ngOnInit(): void {
    this.defaultQuestionaryForm = this.questionaryControlService.mainForm.get('defaultQuestionaryGroup');
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

  close(): void {
    this.dialog.closeAll();
  }

  nextStep(): void {
    if (this.questionaryControlService.currentQuestionIndex
      <
      this.questionaryControlService.questionaryLength - 1 + this.questionaryControlService.defaultQuestionaryLength) {
      this.questionaryControlService.currentQuestionIndex++;
    }
  }

  submitZip() {
    this.projectActionService.zipIsChecking = true;
    this.boundariesService.isZipSupported(this.defaultQuestionaryForm.get('projectLocation.zip').value).subscribe(
      supported => {
        this.projectActionService.zipIsChecking = false;
        this.projectActionService.zipIsSupported = supported;
        if (supported) {
          this.customerSuggestionService.saveUserSearchTerm(this.questionaryControlService.serviceType.name, this.defaultQuestionaryForm.get('projectLocation.zip').value, false);
          this.nextStep();
        }
      },
      error => {
        this.projectActionService.zipIsChecking = false;
        console.log(error)
      }
    );

  }

  submitServiceTypeSelection() {
    if (this.defaultQuestionaryForm.get('serviceType').value) {
      this.questionaryControlService.serviceType = JSON.parse(this.defaultQuestionaryForm.get('serviceType').value);
      this.nextStep();
      this.questionaryControlService.initFormGroup();
    }
  }

  autocompleteServiceSelectionSearch(search): void {
    if (search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredServices = this.questionaryControlService.trade.services.filter(item => Object.values(item).some(str => regExp.test(str as string)));
    } else {
      this.filteredServices = this.questionaryControlService.trade.services;
    }
  }

}
