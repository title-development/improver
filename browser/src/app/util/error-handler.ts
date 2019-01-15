import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PopUpMessageService } from './pop-up-message.service';
import { getErrorMessage, notLoginPage } from './functions';
import { RouterState, RouterStateSnapshot } from '@angular/router';
import { SecurityService } from '../auth/security.service';
import { PopUpMessage, SystemMessageType } from '../model/data-model';

@Injectable()
export class ErrorHandler {
  private timeOut;

  constructor(private popUpService: PopUpMessageService) {

  }

  catch(error: HttpErrorResponse): ErrorHandler {
    switch (error.status) {
      case 0 : {
        this.serviceUnavailable(error);
        break;
      }
      case 400 : {
        this.badRequest(error, getErrorMessage(error) ? getErrorMessage(error) : 'Bad request');
        break;
      }
      case 401 : {
        this.unauthorized(error, getErrorMessage(error) ? getErrorMessage(error) : 'Unauthorized');
        break;
      }
      case 403: {
        this.forbidden(error, getErrorMessage(error) ? getErrorMessage(error) : 'this resource is forbidden');
        break;
      }
      case 404: {
        this.notFound(error, getErrorMessage(error) ? getErrorMessage(error) : 'not found');
        break;
      }
      case 409: {
        this.conflict(error, getErrorMessage(error) ? getErrorMessage(error) : 'Data conflict');
        break;
      }
      case 422: {
        this.unprocessableEntity(error, getErrorMessage(error) ? getErrorMessage(error) : 'Unprocessable Entity');
        break;
      }
      case 500: {
        this.internalServer(error);
        break;
      }
      case 504: {
        this.serviceUnavailable(error, 'Check your internet connection');
        break;
      }
      default: {
        break;
      }
    }
    return this;
  }

  prevent(): void {
    clearTimeout(this.timeOut);
  }

  serviceUnavailable(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 504 || error.status == 0) {
      this.handleServiceUnavailable(message, callback);
    }
    return this;
  }

  internalServer(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 500) {
      this.handleInternalServerError(message, callback);
    }
    return this;
  }

  badRequest(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 400) {
      this.handle(message, callback);
    }
    return this;
  }

  unauthorized(error: HttpErrorResponse, message: string = undefined, callback?: () => void): ErrorHandler {
    if (error.status == 401) {
      this.handle(message, callback);
    }
    return this;
  }

  forbidden(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 403) {
      this.handle(message, callback);
    }
    return this;
  }

  notFound(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 404) {
      this.handle(message, callback);
    }
    return this;
  }

  conflict(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 409) {
      this.handle(message, callback);
    }
    return this;
  }

  unprocessableEntity(error: HttpErrorResponse, message?: string, callback?: () => void): ErrorHandler {
    if (error.status == 422) {
      this.handle(message, callback);
    }
    return this;
  }

  private handle(message: string, callback?: () => void): void {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      if (message) {
        this.popUpService.showError(message);
      }
      if (typeof callback == 'function') {
        callback.call(this);
      }
    }, 0);
  }

  private handleInternalServerError(message?: string, callback?: () => void): void {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      if (message) {
        this.popUpService.showInternalServerError({
          text: message,
          type: SystemMessageType.ERROR,
          timeout: 10000
        });
      } else {
        this.popUpService.showInternalServerError();
      }
      if (typeof callback == 'function') {
        callback.call(this);
      }
    }, 0);
  }

  private handleServiceUnavailable(message?: string, callback?: () => void): void {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      if (message) {
        this.popUpService.showServiceUnavailable({
          text: message,
          type: SystemMessageType.ERROR,
          timeout: 10000
        });
      } else {
        this.popUpService.showServiceUnavailable();
      }
      if (typeof callback == 'function') {
        callback.call(this);
      }
    }, 0);
  }
}
