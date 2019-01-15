import { EventEmitter, Injectable } from '@angular/core';
import { ZipBoundaries } from '../../../../api/models/ZipBoundaries';
import { CoverageConfig } from '../../../../api/models/CoverageConfig';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../../util/google-map.utils';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CompanyCoverageConfig } from '../../../../api/models/CompanyCoverageConfig';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/index';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';

@Injectable()
export class BasicMode {
  fetching: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  toUpdate: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  private map: google.maps.Map;
  private serveddZipCodes: Array<string>;
  private configCoverage: CoverageConfig;
  private zipsByRadius$: Subscription;
  private boundaries$: Subscription;

  constructor(private gMapUtils: GoogleMapUtilsService,
              private boundariesService: BoundariesService,
              private popUpService: PopUpMessageService,) {

  }

  init(map: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig, servedZipCodes: Array<string>): void {
    this.serveddZipCodes = servedZipCodes;
    this.fetching.next(true);
    this.map = map;
    this.configCoverage = companyCoverageConfig.coverageConfig;
    this.gMapUtils.clearCoverageDataLayers(this.map);

    applyStyleToMapLayers(map);
    this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));
    this.gMapUtils.createCompanyMarkerInfoWindow(this.map);
    if(this.configCoverage.zips.length > 0) {
      this.boundaries$ = this.boundariesService.getZipBoundaries(this.configCoverage.zips)
        .pipe(
          catchError(err => {
            this.fetching.next(false);
            this.popUpService.showInternalServerError();
            return of(null);
          })
        )
        .subscribe((zipBoundaries: ZipBoundaries) => {
            if (zipBoundaries) {
              this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.markAreasZips(zipBoundaries, servedZipCodes));
              this.gMapUtils.fitMapToDataLayer(this.map);
              this.fetching.next(false);
            }
          }, err => {
            console.log(err);
          }
        );
    } else {
      this.map.setCenter(new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));
      this.fetching.next(false);
    }

  }

  getZipsByRadius(center: google.maps.LatLng, radius: number): void {
    this.fetching.next(true);
    this.configCoverage.radius = radius;
    this.zipsByRadius$ = this.boundariesService.queryByRadius(center.lat(), center.lng(), radius).subscribe((zipBoundaries: ZipBoundaries) => {
      applyStyleToMapLayers(this.map);
      this.gMapUtils.clearCoverageDataLayers(this.map);
      this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.markAreasZips(zipBoundaries, this.serveddZipCodes));
      this.gMapUtils.fitMapToDataLayer(this.map);
      this.fetching.next(false);
      this.toUpdate.emit(zipBoundaries.features.map(feature => feature.properties.zip));
    }, err => {
      this.fetching.next(false);
      console.log(err);
    });
  }

  destroy(): void {
    this.gMapUtils.removeCompanyMarker();
    this.gMapUtils.removeCompanyMarkerInfoWindowListeners();
    if (this.zipsByRadius$) {
      this.zipsByRadius$.unsubscribe();
    }
    if (this.boundaries$) {
      this.boundaries$.unsubscribe();
    }
  }

}
