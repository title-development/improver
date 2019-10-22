import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'imp-map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['../../styles/sidebar-item.scss', './map-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapControlsComponent {
  @Output()
  readonly onZoomIn = new EventEmitter<void>();

  @Output()
  readonly onZoomOut = new EventEmitter<void>();

  @Output()
  readonly centerMap = new EventEmitter<void>();

  zoomIn(): void {
    this.onZoomIn.emit();
  }

  zoomOut(): void {
    this.onZoomOut.emit();
  }

  onCenterMap(): void {
    this.centerMap.emit();
  }
}
