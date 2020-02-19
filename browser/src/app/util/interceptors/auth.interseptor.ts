import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let updatedHeaders = req.headers;
    if (localStorage.getItem('user')) {
      const authToken = JSON.parse(localStorage.getItem('user')).token;
      updatedHeaders.set('Authorization', authToken)
    } else {
      updatedHeaders.delete('Authorization')
    }

    const authReq = req.clone({
      headers: updatedHeaders
    });

    return next.handle(authReq);
  }
}
