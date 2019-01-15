import { Injectable } from '@angular/core';
import { BaseRequestOptions, RequestOptions } from '@angular/http';

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {

  constructor() {
    super();

    // Set the default 'Content-Type' header
    this.headers.set('Content-Type', 'application/json');
    this.checkToken();
  }

  private checkToken() {
    if (localStorage.getItem('user')) {
      this.headers.set('authorization', JSON.parse(localStorage.getItem('user')).token);
    } else {
      this.headers.delete('authorization')
    }
  }
}

export const requestOptionsProvider = { provide: RequestOptions, useClass: DefaultRequestOptions };
