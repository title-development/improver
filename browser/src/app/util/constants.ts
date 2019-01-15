import { Injectable } from '@angular/core';
import { TricksService } from './tricks.service';
import { Accreditation, State } from '../model/data-model';
import { Project } from '../api/models/Project';
import { Question } from '../api/models/Question';

@Injectable()
export class Constants {
  COMPANY_FOUNDATION_MIN_YEAR = 1900;
  REVIEW_MESSAGE_MAX_LENGTH: number = 1500;
  REVIEW_MESSAGE_MIN_LENGTH: number = 10;
  patterns: any;
  projectStatuses: Array<any>;
  months: string[];
  years: number[];
  headerCountPropName: string;
  states: any[];
  accreditations: any[];
  questionType: Array<any>;

  constructor(private tricksService: TricksService,) {
    this.patterns = {

      // TODO: add full explanation https://goo.gl/M9VaId
      email: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@(([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3})|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',

      // at least 8 characters
      // at least 1 numeric character
      // at least 1 lowercase or uppercase letter
      password: '^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$',

      zipcode: '(^\\d{5}$)' + // XXXXX (X is digit)
        '|' + // or
        '(^\\d{5}-\\d{4}$)',  // XXXXX-XXXX (X is digit)

      // TODO: add full explanation
      phone: '^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$',

      numeric: '^\\d*$', //only digits

      creditCard: {
        cardNumber: '(^\\d{16}$)',   //has 16 digits

        securityCode: '(^\\d{3}$)' + // has 3 digits
          '|' + // or
          '(^\\d{4}$)',  // has 4 digits

        zipcode: '(^\\d{5}$)' // has 5 digits
      }
    };

    this.months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    this.headerCountPropName = 'total';

    this.states = tricksService.enumToJson(State);
    this.accreditations = this.tricksService.enumToJson(Accreditation);
    this.questionType = this.tricksService.enumToJson(Question.Type);
    this.projectStatuses = this.tricksService.enumToJson(Project.Status);

  }

}
