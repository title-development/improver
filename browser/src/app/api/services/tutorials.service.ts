import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { UserTutorial } from '../models/UserTutorial';
import { SecurityService } from '../../auth/security.service';

@Injectable()
export class TutorialsService {
  tutorials$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>(null);
  private tutorialsState: Array<string>;
  private readonly apiUrl: string = 'api/tutorials';

  constructor(private http: HttpClient,
              private securityService: SecurityService) {
    this.securityService.onUserInit.subscribe(() => {
      this.getTutorials().pipe(first()).subscribe(() => {
      });
    });
    this.securityService.onLogout.subscribe(() => {
      this.tutorialsState = null;
      this.tutorials$.next(null);
    });
  }

  complete(tutorial: UserTutorial): void {
    this.tutorialsState = this.tutorialsState.filter(item => item != tutorial.tutorial);
    this.tutorials$.next(this.tutorialsState);
    this.http.post(this.apiUrl, tutorial).pipe(first()).subscribe(() => {
    });
  }

  getTutorials(): Observable<any> {
    if (!this.tutorialsState) {
      return this.http.get(this.apiUrl).pipe(
        switchMap((tutorials: Array<string>) => {
          this.tutorialsState = tutorials;
          this.tutorials$.next(this.tutorialsState);

          return this.tutorials$;
        }),
        catchError(err => {
          console.log(err);

          return of(null);
        })
      );
    } else {
      return this.tutorials$;
    }
  }
}
