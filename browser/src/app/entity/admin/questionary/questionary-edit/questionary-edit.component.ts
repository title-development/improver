import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionariesService } from '../../../../api/services/questionaries.service';
import { Questionary } from '../../../../api/models/Questionary';
import { combineLatest, of, Subscription } from 'rxjs';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { Question } from '../../../../api/models/Question';
import { Constants } from '../../../../util/constants';
import { Answer } from '../../../../api/models/Answer';
import { toSnakeCase } from '../../../../util/functions';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { first, switchMap } from 'rxjs/internal/operators';
import { NgForm, NgModel } from '@angular/forms';
import { ServiceType } from '../../../../model/data-model';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { DragulaService } from 'ng2-dragula';
import { Location } from "@angular/common";

@Component({
  selector: 'questionaries-edit',
  templateUrl: './questionary-edit.component.html',
  styleUrls: ['./questionary-edit.component.scss']
})
export class QuestionaryEditComponent implements OnDestroy {

  pageTitle: string;
  displayEditDialog: boolean;
  questionary: Questionary;
  selectedQuestion: Question = new Question('', '', '', Question.Type.TEXT_INPUT, []);
  serviceTypes: Array<SelectItem>;
  newAnswer: string;
  editingQuestion: boolean = false;
  preview: boolean = false;
  QuestionType = Question.Type;
  mode: 'add' | 'view' | 'edit';
  questionaryMouseDrag$ = new Subscription();
  questionaryDeagged: boolean = false;

  private editingQuestionIndex: number;

  @ViewChild('addEditQuestionForm') addEditQuestionForm: NgForm;
  @ViewChild('newAnswerLabel') newAnswerLabel: NgModel;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private questionariesService: QuestionariesService,
              private serviceTypeService: ServiceTypeService,
              public constants: Constants,
              private confirmationService: ConfirmationService,
              private popUpService: PopUpMessageService,
              private dragulaService: DragulaService,
              public location: Location) {

    this.questionaryMouseDrag$.add(this.dragulaService.drag("questions-drag-group").subscribe(() => this.questionaryDeagged = true));

    combineLatest(this.route.params, this.route.queryParams).pipe(
      switchMap(([params, queryParams]) => {
        this.mode = params['mode'];
        if (params['id'] && this.mode != 'add') {
          return this.questionariesService.getQuestionaryById(params['id']);
        } else {
          const serviceType = queryParams['serviceType'] ? [JSON.parse(queryParams['serviceType'])] : [];
          return of(new Questionary('', '', [...serviceType], []));
        }
      }),
      switchMap((questionary: Questionary) => {
        if (questionary) {
          this.pageTitle = questionary.id ? `Edit Questionary` : 'Add New Questionary';
          this.questionary = questionary;

          return this.serviceTypeService.getAllWithQuestionary();
        } else {
          return of(null);
        }
      })
    ).subscribe((serviceTypes: Array<Array<ServiceType>>) => {
        if (serviceTypes instanceof Array) {
          const [widthOut, width] = serviceTypes;
          this.serviceTypes = [
            ...this.questionary.serviceTypes
              .map(item => {
                return {
                  label: item.name,
                  value: item,
                  disabled: false
                };
              }),
            ...widthOut
              .filter(item => !this.questionary.serviceTypes.some(el => el.id == item.id))
              .map(item => {
                return {
                  label: item.name,
                  value: item,
                  disabled: false
                };
              }),
            ...width
              .filter(item => !this.questionary.serviceTypes.some(el => el.id == item.id))
              .map(item => {
                return {
                  label: item.name,
                  value: item,
                  disabled: true
                };
              })
          ];
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  addUpdateQuestionary(): void {
    if (this.questionary.id) {
      this.questionariesService.updateQuestionary(this.questionary.id, this.questionary)
        .subscribe(res => {
            this.popUpService.showSuccess(`Questionary ${this.questionary.name} has been updated`);
            this.getQuestionary(this.questionary.id);
            this.router.navigate(['admin', 'questionaries']);
          },
          err => {
            this.popUpService.showError(`Could not update Questionary`);
          }
        );
    } else {
      this.questionariesService.addQuestionary(this.questionary)
        .subscribe(res => {
          this.popUpService.showSuccess(`Questionary ${this.questionary.name} has been added`);
            this.router.navigate(['admin', 'questionaries']);
          }, err => {
            this.popUpService.showError(`Could not add Questionary`);
          }
        );
    }
  }

  getQuestionary(id: number): void {
    this.questionariesService.getQuestionaryById(id).pipe(
      first()
    ).subscribe((questionary: Questionary) => {
      if (questionary) {
        this.questionary = questionary;
      }
    }, err => {
      this.popUpService.showError(`Could not get questionary`);
    });
  }

  /**
   * Questions
   */

  editQuestion(question: Question, index: number = -1): void {
    this.displayEditDialog = true;
    if (index >= 0) {
      this.editingQuestion = true;
      this.editingQuestionIndex = index;
    }
    this.selectedQuestion = JSON.parse(JSON.stringify(question));
  }

  addNewAnswer(): void {
    if (this.newAnswer && this.newAnswer.length > 1 && this.newAnswer.length < 255) {
      const answersCount: number = this.selectedQuestion.answers.length + 1;
      const name: string = `${answersCount}_${toSnakeCase(this.newAnswer)}`;
      const answer = new Answer(name, '', this.newAnswer);
      if (this.selectedQuestion.answers.length > 0) {
        this.selectedQuestion.answers.push(answer);
      } else {
        this.selectedQuestion.answers = [answer];
      }

      this.newAnswerLabel.reset();
    }
  }

  addUpdateQuestion(question: Question): void {
    this.preview = false;
    question.multipleAnswers = question.type == Question.Type.CHECK_BOX || question.type == Question.Type.IMG_CHECK_BOX;
    if (question.type != Question.Type.TEXT_INPUT && question.type != Question.Type.NUMERIC_INPUT && question.type != Question.Type.TEXT_AREA) {
      question.label = '';
      question.name = '';
    }
    question.name = `${Math.floor(1000 + Math.random() * 9000)}_${toSnakeCase(question.label)}_${toSnakeCase(question.title)}`;

    if (!this.editingQuestion) {
      if (this.questionary.id) {
        this.questionariesService.addQuestion(this.questionary.id, question).subscribe(res => {
          this.popUpService.showSuccess(`Question ${question.name} has been added`);
            this.getQuestionary(this.questionary.id);
            this.questionary.questions.push(question);
            this.displayEditDialog = false;
          }, err => {
            this.popUpService.showError(`Could not add ${question.title ? question.title : question.name}`);
          }
        );
      } else {
        this.questionary.questions.push(question);
      }
    } else {
      if (this.questionary.id) {
        this.questionariesService.updateQuestion(question.id, question).subscribe(res => {
          this.popUpService.showSuccess(`Question ${question.title ? question.title : question.name} has been updated`);
            this.getQuestionary(this.questionary.id);
            this.displayEditDialog = false;
          }, err => {
            this.popUpService.showError(`Could not update ${question.title ? question.title : question.name}`);
          }
        );
      } else {
        this.questionary.questions[this.editingQuestionIndex] = this.selectedQuestion;
      }
    }
    this.displayEditDialog = false;
  }

  deleteQuestion(event: Event, question: Question, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmationService.confirm({
      icon: 'pi pi-question-circle',
      header: 'Delete Question?',
      message: `Do you want to delete ${question.title}`,
      accept: () => {
        if (question && question.id) {
          this.questionariesService.deleteQuestionById(question.id).subscribe(res => {
              this.questionary.questions = this.questionary.questions.filter(item => item.id != question.id);
              this.popUpService.showSuccess(`Question ${question.title} has been deleted`);
            }, err => {
              this.popUpService.showError(`Could not delete ${question.title}`)
            }
          );
        } else {
          this.questionary.questions.splice(index, 1);
        }
      }
    });

  }

  deleteAnswer(answer: Answer, event: Event = undefined): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (answer) {
      this.deleteAnswerImage(answer);
      this.selectedQuestion.answers = this.selectedQuestion.answers.filter(item => {
        if (answer.id) {
          return answer.id != item.id;
        } else {
          return JSON.stringify(item) != JSON.stringify(answer);
        }
      });
    }
  }

  deleteAnswerImage(answer: Answer): void {
    if (answer.id) {
      this.questionariesService.deleteAnswerImage(answer.id).subscribe(res => {
        this.popUpService.showSuccess(`Image has been deleted`);
      }, err => {
        this.popUpService.showError('Could not delete image');
      });
    }
  }

  addNewQuestion(): void {
    const question = new Question('', '', '', Question.Type.TEXT_INPUT, []);
    this.editQuestion(question);
  }

  resetAddEditQuestionForm(): void {
    this.selectedQuestion = null;
    this.closeQuestionDialog();
  }

  closeQuestionDialog() {
    this.editingQuestion = false;
    this.editingQuestionIndex = -1;
  }

  formHasChanges() {

  }


  //Trick to avoid error
  isAnswerRendered(model: NgModel) {
    setTimeout(() => {
      return model;
    },0);
  }

  ngOnDestroy() {
    if(this.questionaryMouseDrag$) {
      this.questionaryMouseDrag$.unsubscribe();
    }
  }

}
