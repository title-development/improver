import { Injectable, NgZone } from '@angular/core';

@Injectable()
export class MapMarkersStore {

  private handler: { type: string, callback: any };
  private markers: Array<any> = [];

  hasMarkers(): boolean {
    return this.markers.length > 0;
  }

  getMarkers(): Array<any> {
    return this.markers;
  }

  addMarker(marker): void {
    if (marker) {
      this.markers.push(marker);
    }
  }

  deleteMarkers(): void {
    if (this.markers.length > 0) {
      for (const marker of this.markers) {
        google.maps.event.clearListeners(marker, this.handler.type);
        marker.setMap(null);
      }
    }
    this.markers = [];
  }

  setListener(type, callback): void {
    if (!this.handler) {
      this.handler = {type: type, callback: callback};
    }
  }
}
