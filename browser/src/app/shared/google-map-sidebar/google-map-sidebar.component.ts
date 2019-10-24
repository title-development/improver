import { MapOptions } from '@agm/core/services/google-maps-types';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ZipHistory } from '../../entity/settings/contractor-account/service-area/models/zip-history';
import { createConsoleLogger } from '@angular-devkit/core/node';

@Component({
  selector: 'imp-gmap-sidebar',
  templateUrl: './google-map-sidebar.component.html',
  styleUrls: ['./google-map-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleMapSidebarComponent {
  @Input()
  isDetailMode: boolean = false;

  @Input()
  zipHistory: ZipHistory;

  @Input()
  isUnsavedChanges: boolean;

  @Input()
  gMap;

  @Input()
  center;

  @Input()
  mapMinZoom: number;

  @Input()
  mapMaxZoom: number;

  @Output()
  readonly undoHistory = new EventEmitter<string>();

  zoomIn(): void {
    const zoom = this.gMap.getZoom();
    if (zoom >= this.mapMaxZoom) {
      return;
    }
    this.gMap.setZoom(zoom + 1);
  }

  zoomOut(): void {
    const zoom = this.gMap.getZoom();
    if (zoom <= this.mapMinZoom) {
      return;
    }
    this.gMap.setZoom(zoom - 1);
  }

  undo(zipCode: string): void {
    this.undoHistory.emit(zipCode);
  }

  centerMap() {
    if (!this.center) {
      return;
    }
    this.gMap.setCenter(this.center);
  }
}
