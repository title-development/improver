import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, first, mergeMap } from 'rxjs/operators';
import { SecurityService } from '../../auth/security.service';
import { UserTutorial } from '../models/UserTutorial';

@Injectable()
export class TutorialsService {
  tutorials$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private tutorialsState: string[];
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

  complete(tutorial: UserTutorial): Observable<unknown> {
    this.tutorialsState = this.tutorialsState.filter((item) => item != tutorial.tutorial);
    this.tutorials$.next(this.tutorialsState);

    return this.http.post(this.apiUrl, tutorial);
  }

  getTutorials(): Observable<any> {
    if (!this.tutorialsState) {
      return this.http.get(this.apiUrl).pipe(
        mergeMap((tutorials: string[]) => {
          this.tutorialsState = tutorials;
          this.tutorials$.next(this.tutorialsState);

          return this.tutorials$;
        }),
        catchError((err) => {
          console.error(err);

          return of(null);
        }),
      );
    } else {
      return this.tutorials$;
    }
  }

  showCoverageTutorial(): void {
    if (!this.tutorialsState.includes(UserTutorial.Tutorial.COVERAGE)) {
      this.tutorialsState.push(UserTutorial.Tutorial.COVERAGE);
      this.tutorials$.next(this.tutorialsState);
    }
  }
}
