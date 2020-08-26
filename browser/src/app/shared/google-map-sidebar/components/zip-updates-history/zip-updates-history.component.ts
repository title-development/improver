import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ZipHistory } from '../../../../components/settings/contractor-account/service-area/models/zip-history';

@Component({
  selector: 'imp-zip-updates-history',
  templateUrl: './zip-updates-history.component.html',
  styleUrls: ['../../styles/sidebar-item.scss', './zip-updates-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZipUpdatesHistoryComponent {

  @Input() zipHistory: ZipHistory;

  @Output() readonly undo = new EventEmitter<string>();

  isHistoryShowed: boolean = true;

  toggleHistory(): void {
    this.isHistoryShowed = !this.isHistoryShowed;
  }

  trackByFn(index: number, item: string): string {
    return item;
  }

  undoAction(zipCode: string): void {
    this.undo.emit(zipCode);
  }

}
