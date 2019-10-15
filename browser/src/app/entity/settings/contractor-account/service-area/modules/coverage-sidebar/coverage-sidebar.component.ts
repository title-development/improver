import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ZipHistory } from '../../models/zip-history';
import { CoverageService } from '../../services/coverage.service';

@Component({
  selector: 'imp-coverage-sidebar',
  templateUrl: './coverage-sidebar.component.html',
  styleUrls: ['./coverage-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverageSidebarComponent {
  @Input()
  isDetailMode: boolean;

  @Input()
  zipHistory: ZipHistory;

  @Input()
  isUnsavedChanges: boolean;

  @Output()
  readonly undoHistory = new EventEmitter<string>();

  constructor(private coverageService: CoverageService) {}

  zoomIn(): void {
    this.coverageService.zoomIn();
  }

  zoomOut(): void {
    this.coverageService.zoomOut();
  }

  undo(zipCode: string): void {
    this.undoHistory.emit(zipCode);
  }
}
