export enum QuestionType {
  TEXT_INPUT = <any>'TEXT_INPUT',
  TEXT_AREA = <any>'TEXT_AREA',
  NUMERIC_INPUT = <any>'NUMERIC_INPUT',
  CHECK_BOX = <any>'CHECK_BOX',
  RADIO_BUTTON = <any>'RADIO_BUTTON',
  IMG_CHECK_BOX = <any>'IMG_CHECK_BOX',
  IMG_RADIO_BUTTON = <any>'IMG_RADIO_BUTTON'
}


export class Answer {
  id: number;
  name: string;
  label: string;
}


export class QuestionaryBlock {
  id?: number;
  title?: string;
  name?: string;
  type?: QuestionType;
  answers?: Answer[];
  results?: string[];

  constructor(name: string, results: string[]) {
    this.name = name;
    this.results = results;
  }
}
