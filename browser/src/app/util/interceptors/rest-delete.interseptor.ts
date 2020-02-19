import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Fix problem with default response type of Angular HttpClient for DELETE method with empty body
 */

@Injectable()
export class RestDeleteInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.method === 'DELETE') {
            request = request.clone({
                responseType: 'text'
            });
        }

        return next.handle(request);

    }
}
