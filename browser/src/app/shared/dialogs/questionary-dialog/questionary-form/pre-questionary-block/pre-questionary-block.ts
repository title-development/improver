import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { QuestionaryControlService } from '../../../../../api/services/questionary-control.service';
import { ServiceType } from '../../../../../model/data-model';
import { Constants } from '../../../../../util/constants';
import { TextMessages } from '../../../../../util/text-messages';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../../../model/security-model';
import { SecurityService } from '../../../../../auth/security.service';
import { ProjectService } from '../../../../../api/services/project.service';
import { LocationValidateService } from '../../../../../api/services/location-validate.service';
import { PopUpMessageService } from '../../../../../api/services/pop-up-message.service';
import { Router } from '@angular/router';
import { ProjectActionService } from '../../../../../api/services/project-action.service';
import { CompanyService } from '../../../../../api/services/company.service';
import { ErrorHandler } from '../../../../../util/handlers/error-handler';
import { BoundariesService } from "../../../../../api/services/boundaries.service";
import { UserService } from "../../../../../api/services/user.service";
import { AccountService } from "../../../../../api/services/account.service";
import { CustomerSuggestionService } from "../../../../../api/services/customer-suggestion.service";
import { TradeService } from "../../../../../api/services/trade.service";
import { DeviceControlService } from "../../../../../api/services/device-control.service";
import { SearchHolder } from "../../../../../util/search-holder";
import { PerfectScrollbarComponent } from "ngx-perfect-scrollbar";

@Component({
  selector: 'pre-questionary-block',
  templateUrl: './pre-questionary-block.html',
  styleUrls: ['./pre-questionary-block.scss'],
})

export class PreQuestionaryBlock implements OnInit, AfterViewInit {

  @ViewChildren('defaultQuestion') defaultQuestions: QueryList<ElementRef>;
  @ViewChild('perfectScroll') perfectScroll: PerfectScrollbarComponent;

  Role = Role;
  defaultQuestionaryForm;
  lastZipCode: string;
  serviceSearch;

  searchResultMessageText: string = '';

  services: ServiceType[] = [];
  filteredServices: ServiceType[] = [];
  searchHolder: SearchHolder<ServiceType>

  constructor(public questionaryControlService: QuestionaryControlService,
              public projectService: ProjectService,
              public tradeService: TradeService,
              public projectActionService: ProjectActionService,
              public securityService: SecurityService,
              public userService: UserService,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: TextMessages,
              public popUpMessageService: PopUpMessageService,
              public customerSuggestionService: CustomerSuggestionService,
              public deviceControlService: DeviceControlService,
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
        if (this.securityService.hasRole(Role.CUSTOMER)) {
          this.getLastCustomerZipCode();
        }
      }
    );

    if (this.questionaryControlService.trade) {
      this.filteredServices = this.services = this.questionaryControlService.trade.services;
      this.searchHolder = new SearchHolder<ServiceType>(this.services)
    }

  }

  ngOnInit(): void {
    this.defaultQuestionaryForm = this.questionaryControlService.mainForm.get('defaultQuestionaryGroup');
    this.defaultQuestionaryForm.get('projectLocation.zip').setValue(this.lastZipCode);
  }

  ngAfterViewInit(): void {
    // fix to prevent displaying of initial state of perfect scroll
    setTimeout(() => {
      this.perfectScroll.directiveRef.update()
      this.perfectScroll.directiveRef.config.suppressScrollY = false;
    }, 300)
  }

  isValid(name) {
    return this.defaultQuestionaryForm.get(name).valid;
  }

  getLastCustomerZipCode() {
    this.customerSuggestionService.lastCustomerZipCode$
        .subscribe(
          zipCode => this.lastZipCode = zipCode
        )
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
      err => {
        console.error(err);
        this.projectActionService.zipIsChecking = false;
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

  autocompleteServiceSelectionSearch(searchTerm): void {
    if (searchTerm && searchTerm.length > 0) {
      setTimeout(() => {
        let searchResults = this.searchHolder.search(searchTerm);

        if (searchResults.length == 0){
          this.searchResultMessageText = `No results were found for "${searchTerm}".`;
          this.filteredServices = [];
          return;
        } else {
          this.searchResultMessageText = '';
        }

        let serviceTypeIds = searchResults.map(e => e.id);
        this.filteredServices = this.services.filter(e => serviceTypeIds.includes(e.id))

      })
    } else {
      this.filteredServices = this.services;
    }

  }

}
