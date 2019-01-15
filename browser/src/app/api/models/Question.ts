import { Answer } from './Answer';

export class Question {
  id: number;
  name: string;
  label: string;
  title: string;
  type: string;
  answers: Array<Answer>;
  multipleAnswers: boolean;
  inputAnswer: boolean;

  constructor(name: string, label: string, title: string, type: string, answers: Array<Answer>) {
    this.name = name;
    this.label = label;
    this.title = title;
    this.type = type;
    this.answers = answers;
  }
}

export namespace Question {
  export enum Type {
    TEXT_INPUT = 'TEXT_INPUT',
    TEXT_AREA = 'TEXT_AREA',
    NUMERIC_INPUT = 'NUMERIC_INPUT',
    CHECK_BOX = 'CHECK_BOX',
    RADIO_BUTTON = 'RADIO_BUTTON',
    IMG_CHECK_BOX = 'IMG_CHECK_BOX',
    IMG_RADIO_BUTTON = 'IMG_RADIO_BUTTON'
  }
}
