import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CompanyCoverageConfig } from '../../../../../../api/models/CompanyCoverageConfig';
import { CvSwitchComponent } from '../../../../../../theme/switch/switch.component';
import { UNSAVED_CHANGES_MESSAGE } from '../../../../../../util/messages';
import { ICircleProps } from '../../interfaces/circle-props';
import { IZipCodeProps } from '../../interfaces/zip-code-props';

@Component({
  selector: 'imp-coverage-configuration',
  templateUrl: './coverage-configuration.component.html',
  styleUrls: ['./coverage-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverageConfigurationComponent implements OnDestroy {

  @Input() companyCoverageConfig: CompanyCoverageConfig;
  @Input() servedZipCodes: string[];
  @Input() fetching: boolean;
  @Input() isUnsavedChanges: boolean;

  @Output() readonly showTutorial = new EventEmitter<void>();
  @Output() readonly onCirclePropsChanged = new EventEmitter<ICircleProps>();
  @Output() readonly onZipCodeFound = new EventEmitter<IZipCodeProps>();
  @Output() readonly modeChange = new EventEmitter<boolean>();

  @ViewChild(CvSwitchComponent) cvSwitchComponent: CvSwitchComponent;

  get isManualMode(): boolean {
    return this.companyCoverageConfig && this.companyCoverageConfig.coverageConfig.manualMode;
  }

  private readonly destroyed$ = new Subject<void>();

  preventSwitch(event: MouseEvent): void {
    if (this.isUnsavedChanges) {
      if (!confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        this.isUnsavedChanges = false;
        this.cvSwitchComponent.toggle(event);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  modeStateChange(isBasicMode: boolean): void {
    this.modeChange.emit(isBasicMode);
  }

  openTutorial(): void {
    this.showTutorial.emit();
  }

  circlePropsUpdated(circleProps: ICircleProps): void {
    this.onCirclePropsChanged.emit(circleProps);
  }

  zipCodeFound(zipCodeProps: IZipCodeProps): void {
    this.onZipCodeFound.emit(zipCodeProps);
  }
}
