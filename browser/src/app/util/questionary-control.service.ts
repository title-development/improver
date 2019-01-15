import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuestionaryBlock, QuestionType } from '../model/questionary-model';
import { SecurityService } from '../auth/security.service';
import { Account, ServiceType } from '../model/data-model';
import { Role } from '../model/security-model';

@Injectable()
export class QuestionaryControlService {

  public DEFAULT_QUESTIONARY_LENGTH = 6;
  public DEFAULT_QUESTIONARY_LENGTH_CUSTOMER = 4;

  public defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;

  public showQuestionary = false;
  public questionaryIsLoading = false;
  public currentQuestionIndex = -1;
  public withZip: boolean = false;
  public questionaryLength = 0;
  public totalQuestionaryLength;

  public zip = '';
  public serviceType: ServiceType;
  public customerAccount: Account = {
    id: 0,
    iconUrl: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  };

  constructor(private securityService: SecurityService) {
  }

  toFormGroup(questions: QuestionaryBlock[]) {
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

  addDefaultQuestions(group: any) {

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
    this.currentQuestionIndex = -1;
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

  updateQuestionaryTotalLength(questionaryLength) {
    this.questionaryLength = questionaryLength;

    if (this.securityService.hasRole(Role.CUSTOMER)) {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH_CUSTOMER;
    } else {
      this.defaultQuestionaryLength = this.DEFAULT_QUESTIONARY_LENGTH;
    }

    this.totalQuestionaryLength = this.questionaryLength + this.defaultQuestionaryLength;
    this.questionaryIsLoading = false;
  }

}
