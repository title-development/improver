import { Component, HostBinding, Input } from '@angular/core';
import { Question } from '../../../../api/models/Question';

@Component({
  selector: 'question-preview',
  templateUrl: './question-preview.component.html',
  styleUrls: ['./question-preview.component.scss']
})
export class QuestionPreviewComponent {

  @Input() @HostBinding('class.-open') toggle: boolean;
  @Input() question: Question;
  QuestionType = Question.Type;

  constructor() {

  }
}
