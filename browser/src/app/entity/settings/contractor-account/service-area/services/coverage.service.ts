import { MapOptions } from '@agm/core/services/google-maps-types';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZipBoundaries, ZipFeature } from '../../../../../api/models/ZipBoundaries';
import { BoundariesService } from '../../../../../api/services/boundaries.service';
import { defaultMapOptions } from '../../../../../util/google-map-default-options';

@Injectable()
export class CoverageService implements OnDestroy {
  fetching$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  unsavedChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private gMap: google.maps.Map;
  private readonly mapOptions: MapOptions = defaultMapOptions;

  constructor(private boundariesService: BoundariesService) {

  }

  findZipBoundariesByZipCode(zipCode: string): Observable<ZipFeature | Observable<never>> {
    return this.boundariesService.getZipBoundaries([zipCode])
      .pipe(map((zipBoundaries: ZipBoundaries) => {
          if (zipBoundaries.features.length) {
            return zipBoundaries.features[0];
          }
          console.error(`zipBoundaries for zipCode[${zipCode}] does not exist`);
          return throwError({error: {message: 'Error while render zip area'}});
        },
      ));
  }

  init(gMap: google.maps.Map): void {
    // TODO: Andriy
    // xs && circle - minZoom = 8
    // xs && manual - minZoom = 9
    // sm && circle - minZoom = 9
    // sm && manual - minZoom = 10
    // other - default
    this.mapOptions.minZoom = 8;
    this.gMap = gMap;
  }

  zoomIn(): void {
    const zoom = this.gMap.getZoom();
    if (zoom >= this.mapOptions.maxZoom) {
      return;
    }
    this.gMap.setZoom(zoom + 1);
  }

  zoomOut(): void {
    const zoom = this.gMap.getZoom();
    if (zoom <= this.mapOptions.minZoom) {
      return;
    }
    this.gMap.setZoom(zoom - 1);
  }

  ngOnDestroy(): void {
    this.unsavedChanges$.complete();
    this.fetching$.complete();
  }
}
