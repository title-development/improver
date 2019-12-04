import { QuestionaryBlock } from "./questionary-model";


export class ServiceQuestionaryModel {

  questions: Array<QuestionaryBlock>;
  hasPhone: boolean;

  constructor(questions: Array<QuestionaryBlock>, hasPhone: boolean){
    this.questions = questions;
    this.hasPhone = hasPhone;
  }
}
