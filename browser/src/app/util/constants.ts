import { Injectable } from '@angular/core';
import { TricksService } from '../api/services/tricks.service';
import { Accreditation, State } from '../model/data-model';
import { Project } from '../api/models/Project';
import { Question } from '../api/models/Question';

@Injectable()
export class Constants {
  readonly COMPANY_FOUNDATION_MIN_YEAR = 1900;
  readonly REVIEW_MESSAGE_MAX_LENGTH: number = 1500;
  readonly REVIEW_MESSAGE_MIN_LENGTH: number = 10;
  readonly ADMIN_PROJECT_VALIDATION_COMMENT_MIN_SIZE: number = 10;
  readonly ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE: number = 500;
  readonly PROJECT_DESCRIPTION_MIN_LENGTH: number = 30;
  readonly REFERRAL_BONUS_AMOUNT: number = 10000;
  readonly METERS_IN_MILES = 1609.344;
  readonly COVERAGE_RADIUS_STEP = 1;
  readonly MIN_COVERAGE_RADIUS = 5;
  readonly MAX_COVERAGE_RADIUS = 50;
  readonly ZIPCODES_BATCH_SIZE = 500;
  readonly CONFIRMATION_RESEND_BLOCK_TIMEOUT: number = 60;
  readonly PHONE_MAX_LENGTH = 12;
  patterns: any;
  projectStatuses: Array<any>;
  months: string[];
  years: number[];
  headerCountPropName: string;
  states: any[];
  accreditations: any[];
  questionType: Array<any>;
  readonly ONE_MINUTE = 1000 * 60 * 1;

  constructor(private tricksService: TricksService,) {
    this.patterns = {

      // TODO: add full explanation https://goo.gl/M9VaId
      email: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@(([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3})|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',

      name: '^[a-zA-Z\\u00A1-\\uFFFF]+(?:[a-zA-Z0-9\\u00A1-\\uFFFF]|[-\'\\s][a-zA-Z0-9\\u00A1-\\uFFFF]+)*$',

      // at least 8 characters
      // at least 1 numeric character
      // at least 1 lowercase and uppercase letter
      password: '^(?=.*[a-z])(?=.*?[A-Z])(?=.*?[0-9]).{8,}$',

      // at least 8 characters
      // at least 1 numeric character
      // at least 1 lowercase and uppercase letter
      // at least one special character
      complexPassword: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',

      minLength: '.{8,}',                           // min length 8
      number: '(?=.*\\d)',                          // has at least one number
      letter: '(?=\w*[a-zA-Z]\\w*)',                // has at least one letter
      lowercase: '(?=.*[a-z])',                     // has at least one lower case letter
      uppercase: '(?=.*[A-Z])',                     // has at least one upper case letter
      specialCharacter: '[!@#$%^&*(),.?\":{}|<>]',  // has at least one special character

      zipcode: '(^\\d{5}$)' + // XXXXX (X is digit)
        '|' + // or
        '(^\\d{5}-\\d{4}$)',  // XXXXX-XXXX (X is digit)

      // (123) 456-7890
      // (100) 000-0000
      // USA phone pattern
      // phone: '^[2-9]\\d{2}-\\d{3}-\\d{4}$',
      // General phone pattern
      phone: '^\\d{3}-\\d{3}-\\d{4}$',

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
