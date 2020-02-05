import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuestionaryBlock, QuestionType } from '../model/questionary-model';
import { SecurityService } from '../auth/security.service';
import { Account, ServiceType, Trade } from '../model/data-model';
import { Role } from '../model/security-model';
import { ServiceQuestionaryModel } from "../model/service-questionary-model";
import { getErrorMessage } from "./functions";
import { ServiceTypeService } from "../api/services/service-type.service";
import { PopUpMessageService } from "./pop-up-message.service";
import { finalize } from "rxjs/operators";

@Injectable()
export class QuestionaryControlService {

  public DEFAULT_QUESTIONARY_LENGTH = 6;
  public DEFOULT_QUESTIONARY_LENGTH_NOTEXIST_CUSTOMER_PHONE = 5;
  public DEFAULT_QUESTIONARY_LENGTH_CUSTOMER = 4;

  public defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;

  public showQuestionary = false;
  public questionaryIsLoading = false;
  public currentQuestionIndex = -2;
  public withZip: boolean = false;
  public needServiceTypeSelect: boolean = false;
  public customerHasPhone: boolean = false;
  public questionaryLength = 0;
  public totalQuestionaryLength;

  public zip = '';
  public trade: Trade;
  public serviceType: ServiceType;
  public customerAccount: Account = {
    id: 0,
    iconUrl: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  };

  mainForm;
  questionary: ServiceQuestionaryModel;

  constructor(private securityService: SecurityService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService) {
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
          this.updateQuestionaryTotalLength(this.questionary.questions.length, this.questionary.hasPhone);
          this.mainForm = this.toFormGroup(this.questionary.questions);
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
    this.showQuestionary = false;
    this.currentQuestionIndex = -2;
    this.questionaryLength = 0;
    this.totalQuestionaryLength = 0;
    this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;
    this.withZip = false;

    this.customerAccount = {
      id: 0,
      iconUrl: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    };

  }

  updateQuestionaryTotalLength(questionaryLength, hasPhone) {
    this.questionaryLength = questionaryLength;
    this.customerHasPhone = hasPhone;

    if (this.securityService.hasRole(Role.CUSTOMER) && hasPhone) {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH_CUSTOMER;
    } else if (this.securityService.hasRole(Role.CUSTOMER) && !hasPhone) {
      this.defaultQuestionaryLength = this.DEFOULT_QUESTIONARY_LENGTH_NOTEXIST_CUSTOMER_PHONE;
    } else {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;
    }

    this.totalQuestionaryLength = this.questionaryLength + this.defaultQuestionaryLength;
  }

}
