import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Questionary } from '../models/Questionary';
import { Question } from '../models/Question';
import { RestPage } from "../models/RestPage";
import { toHttpParams } from "../../util/functions";
import { Ticket } from "../models/Ticket";

@Injectable()
export class QuestionariesService {

  private url: string = 'api/questionary';
  private questions = '/questions';

  constructor(private http: HttpClient) {

  }

  getAll(filters, pagination): Observable<RestPage<Questionary>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<Questionary>>(`${this.url}`, {params});
  }

  getQuestionaryById(id: number): Observable<Questionary> {

    return this.http.get<Questionary>(`${this.url}/${id}`);
  }

  updateQuestionary(id: number, questionary: Questionary): Observable<any> {

    return this.http.put(`${this.url}/${id}`, questionary);
  }

  addQuestionary(questionary: Questionary): Observable<any> {

    return this.http.post(this.url, questionary);
  }

  deleteQuestionaryById(id: number): Observable<any> {

    return this.http.delete(`${this.url}/${id}`);
  }

  addQuestion(questionariesId: number, question: Question): Observable<any> {

    return this.http.post(`${this.url}/${questionariesId}${this.questions}`, question);
  }

  updateQuestion(questionId: number, question: Question): Observable<any> {

    return this.http.put(`${this.url}${this.questions}/${questionId}`, question);
  }

  deleteQuestionById(questionId: number): Observable<any> {

    return this.http.delete(`${this.url}${this.questions}/${questionId}`);
  }

  deleteAnswerImage(answerId: number): Observable<any> {

    return this.http.delete(`${this.url}/answer-image/${answerId}`);
  }

}
