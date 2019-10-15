import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { publishReplay, refCount, takeUntil } from 'rxjs/operators';
import { UserTutorial } from '../../../../../../api/models/UserTutorial';
import { TutorialsService } from '../../../../../../api/services/tutorials.service';

@Component({
  selector: 'imp-coverage-tutorial',
  templateUrl: './coverage-tutorial.component.html',
  styleUrls: ['./coverage-tutorial.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverageTutorialComponent implements OnDestroy {
  UserTutorial = UserTutorial;

  private readonly destroyed$ = new Subject<void>();

  get tutorials$(): Observable<string[] | null> {
    return this.tutorialService.tutorials$.asObservable()
      .pipe(
        publishReplay(1),
        refCount(),
      );
  }
  constructor(private tutorialService: TutorialsService) { }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  completeTutorial(event: Event): void {
    event.preventDefault();
    this.tutorialService.complete(new UserTutorial(UserTutorial.Tutorial.COVERAGE))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {});
  }

}
