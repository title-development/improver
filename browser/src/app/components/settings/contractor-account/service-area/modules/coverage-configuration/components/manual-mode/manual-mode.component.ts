import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ZipFeature } from '../../../../../../../../api/models/ZipBoundaries';
import { getErrorMessage } from '../../../../../../../../util/functions';
import { PopUpMessageService } from '../../../../../../../../api/services/pop-up-message.service';
import { CoverageService } from '../../../../services/coverage.service';
import { IZipCodeProps } from '../../../../interfaces/zip-code-props';

@Component({
  selector: 'imp-manual-mode',
  templateUrl: './manual-mode.component.html',
  styleUrls: ['../../styles/coverage-modes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualModeComponent implements OnDestroy {
  @Input() servedZipCodes: string[];
  @Input() loading: boolean = false;

  @Output() readonly zipCodeFound = new EventEmitter<IZipCodeProps>();

  searchZipCode: string;
  zipFormErrors: boolean;
  private readonly destroyed$ = new Subject<void>();

  constructor(private coverageService: CoverageService,
              private popUpService: PopUpMessageService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  validateZip(form: NgForm): void {
    this.zipFormErrors = !form.valid;
  }

  onSubmit(zipSearchForm: NgForm): void {
    if (!zipSearchForm.valid) {
      return;
    }
    if (!this.servedZipCodes.includes(this.searchZipCode)) {
      this.popUpService.showWarning(`Zip ${this.searchZipCode} not supported`);
      return;
    }
    this.zipFormErrors = false;
    this.coverageService.fetching$.next(true);
    this.coverageService.findZipBoundariesByZipCode(this.searchZipCode)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.coverageService.fetching$.next(false)),
      ).subscribe((zipFeature: ZipFeature) => this.zipCodeFound.emit({
        zipCode: this.searchZipCode,
        zipFeature,
      } as IZipCodeProps),
      (err) => {
        this.popUpService.showError(getErrorMessage(err));
      });
  }

}
