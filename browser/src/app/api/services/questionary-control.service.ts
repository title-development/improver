import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuestionaryBlock, QuestionType } from '../../model/questionary-model';
import { SecurityService } from '../../auth/security.service';
import { Account, ServiceType, Trade } from '../../model/data-model';
import { Role } from '../../model/security-model';
import { ServiceQuestionaryModel } from "../../model/service-questionary-model";
import { getErrorMessage } from "../../util/functions";
import { ServiceTypeService } from "./service-type.service";
import { PopUpMessageService } from "./pop-up-message.service";
import { finalize, first } from "rxjs/operators";
import { AccountService } from "./account.service";
import { ReplaySubject } from "rxjs";
import { ProjectService } from "./project.service";
import { FileUploader } from "ng2-file-upload";

@Injectable()
export class QuestionaryControlService {

  public readonly DEFAULT_QUESTIONARY_LENGTH = 6;
  public readonly DEFAULT_QUESTIONARY_LENGTH_AUTHORIZED_NO_PHONE = 6;
  public readonly DEFAULT_QUESTIONARY_LENGTH_AUTHORIZED = 5;
  public readonly PRE_QUESTIONARY_LENGTH = 1;

  public defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;

  public showQuestionary = true;
  public questionaryIsLoading = false;
  public currentQuestionIndex = 0;
  public firstQuestionIndex = 0;
  public customerHasPhone: boolean = false;
  public questionaryLength = 0;
  public totalQuestionaryLength;

  public zip = '';
  public serviceType: ServiceType;
  public withZip: boolean = false;
  public withServiceType: boolean = false;
  public trade: Trade;
  public customerAccount: Account = {
    id: 0,
    iconUrl: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  };
  private customerAccountDataFilled = false;
  public customerAccountIsLoading = false;

  mainForm;
  questionary: ServiceQuestionaryModel;
  hasUnsavedChanges: boolean = false;
  projectId
  imageUploader: FileUploader

  public onAccountDataLoaded: ReplaySubject<any> = new ReplaySubject(1);

  constructor(private securityService: SecurityService,
              private serviceTypeService: ServiceTypeService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService,
              private projectService: ProjectService) {

    this.securityService.onUserInit.subscribe(() => this.getAccountData());

    securityService.onLogout.subscribe(() => {
      this.resetCustomerAccount()
      this.clearAccountData()
    })

  }

  toFormGroup(questions: QuestionaryBlock[] = []) {
    let mainFormGroup: any = {};
    let questionaryFormGroup: any = {};
    let defaultQuestionaryFormGroup: any = {};

    questions.forEach(question => {
      let required = question.type == QuestionType.TEXT_INPUT ||
                      question.type == QuestionType.TEXT_AREA ||
                      question.type == QuestionType.NUMERIC_INPUT ||
                      question.type == QuestionType.RADIO_BUTTON ||
                      question.type == QuestionType.IMG_RADIO_BUTTON ||
                      question.type == QuestionType.CHECK_BOX ||
                      question.type == QuestionType.IMG_CHECK_BOX;

      questionaryFormGroup[question.name] = required ? new FormControl('', Validators.required)
        : new FormControl();
    });

    this.addDefaultQuestions(defaultQuestionaryFormGroup);
    mainFormGroup.questionaryGroup = new FormGroup(questionaryFormGroup);
    mainFormGroup.defaultQuestionaryGroup = new FormGroup(defaultQuestionaryFormGroup);
    return new FormGroup(mainFormGroup);
  }

  initFormGroup() {
    this.questionaryIsLoading = true;

    if (this.serviceType) {
      this.serviceTypeService.getQuestionary(this.serviceType.id)
        .pipe(finalize(() => this.questionaryIsLoading = false))
        .subscribe(
        (questionary: ServiceQuestionaryModel )=> {
          this.questionary = questionary;
          this.updateQuestionaryParams(this.questionary.questions.length, this.questionary.hasPhone);
          this.mainForm = this.toFormGroup(this.questionary.questions);
          this.showQuestionary = true;
        },
        err => this.popUpService.showError(getErrorMessage(err))
      );

    } else {
      this.mainForm = this.toFormGroup([]);
      this.questionaryIsLoading = false;
    }

  }

  addDefaultQuestions(group: any) {

    group.serviceType = new FormControl('');

    group.startExpectation = new FormControl('', Validators.required);
    group.notes = new FormControl('');

    let customerPersonalInfoGroup: any = {};
    customerPersonalInfoGroup.firstName = new FormControl(this.customerAccount.firstName, Validators.required);
    customerPersonalInfoGroup.lastName = new FormControl(this.customerAccount.lastName, Validators.required);
    customerPersonalInfoGroup.email = new FormControl(this.customerAccount.email, Validators.required);
    customerPersonalInfoGroup.phone = new FormControl(this.customerAccount.phone, Validators.required);
    customerPersonalInfoGroup.password = new FormControl('');
    group.customerPersonalInfo = new FormGroup(customerPersonalInfoGroup);

    let projectLocationGroup: any = {};
    projectLocationGroup.streetAddress = new FormControl('', Validators.required);
    projectLocationGroup.city = new FormControl('', Validators.required);
    projectLocationGroup.state = new FormControl('', Validators.required);
    projectLocationGroup.zip = new FormControl(this.zip, Validators.required);
    group.projectLocation = new FormGroup(projectLocationGroup);

    return group;
  }

  resetQuestionaryForm() {
    this.firstQuestionIndex = 0;
    this.currentQuestionIndex = 0;
    this.questionaryLength = 0;
    this.totalQuestionaryLength = 0;
    this.serviceType = null;
    this.withServiceType = false;
    this.trade = null;
    this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;
    this.withZip = false;
    this.withServiceType = false;
    this.customerAccountDataFilled = false;
    this.customerAccountIsLoading = false;
    this.resetCustomerAccount();
    this.imageUploader = null;
  }

  updateQuestionaryParams(questionaryLength = this.questionaryLength, hasPhone = this.customerHasPhone) {
    this.questionaryLength = questionaryLength;
    this.customerHasPhone = hasPhone;

    if (this.securityService.hasRole(Role.CUSTOMER) && hasPhone) {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH_AUTHORIZED;
    } else if (this.securityService.hasRole(Role.CUSTOMER) && !hasPhone) {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH_AUTHORIZED_NO_PHONE;
    } else {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;
    }

    this.totalQuestionaryLength = this.questionaryLength + this.defaultQuestionaryLength;
  }

  previousQuestion(decrementIndex = 1) {

    if (this.currentQuestionIndex >= this.firstQuestionIndex + decrementIndex) {
      this.currentQuestionIndex -= decrementIndex;
    }

    if (!this.withServiceType && (this.currentQuestionIndex == -1 && this.withZip || this.currentQuestionIndex == -2 && !this.withZip)) {
      this.serviceType = null;
      this.clearPreSavedProject();
    }

  }

  getAccountData() {
    if(this.securityService.getLoginModel()?.id) {
      this.customerAccountIsLoading = true;
      this.accountService
        .getAccount(this.securityService.getLoginModel().id)
        .pipe(finalize(() => this.customerAccountIsLoading = false))
        .subscribe(
          account => {
            this.customerAccount = account;
            this.updateQuestionaryParams(undefined, !!this.customerAccount.phone)
            this.fillCustomerAccountData()
            this.onAccountDataLoaded.next(this.customerAccount)
          },
          err => {
            this.onAccountDataLoaded.next(null)
            console.error(err);
          }
        );
    }
  }

  fillCustomerAccountData(account = this.customerAccount) {
   if (!this.customerAccountDataFilled && this.mainForm) {
      this.mainForm.get('defaultQuestionaryGroup').get('customerPersonalInfo').patchValue({
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone
      });
      this.customerAccountDataFilled = true;
    }
  }

  clearAccountData() {
    this.customerAccountDataFilled = false;

    if(this.mainForm) {
      this.mainForm.get('defaultQuestionaryGroup').get('customerPersonalInfo').patchValue({
        email: '',
        firstName: '',
        lastName: '',
        phone: ''
      });

    }

  }

  resetCustomerAccount() {
    this.customerHasPhone = false;
    this.customerAccount = {
      id: 0,
      iconUrl: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    };
  }

  clearPreSavedProject() {
    if (this.projectId) {
      this.projectService.deleteProject(this.projectId)
        .pipe(first())
        .subscribe()
      this.projectId = null;
    }
  }

}
