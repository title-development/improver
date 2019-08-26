import { EventEmitter, Injectable } from '@angular/core';
import { ZipBoundaries } from '../../../../../api/models/ZipBoundaries';
import { CoverageConfig } from '../../../../../api/models/CoverageConfig';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../../../util/google-map.utils';
import { BoundariesService } from '../../../../../api/services/boundaries.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { CompanyCoverageConfig } from '../../../../../api/models/CompanyCoverageConfig';
import { catchError, takeUntil } from 'rxjs/operators';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { Constants } from '../../../../../util/constants';

@Injectable()
export class BasicModeService {
  fetching: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  toUpdate: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  private map: google.maps.Map;
  private servedZipCodes: Array<string>;
  private configCoverage: CoverageConfig;
  private readonly destroyed$ = new Subject<void>();

  constructor(private gMapUtils: GoogleMapUtilsService,
              private boundariesService: BoundariesService,
              private popUpService: PopUpMessageService,
              private constants: Constants) {

  }

  init(map: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig, servedZipCodes: Array<string>): void {
    this.servedZipCodes = servedZipCodes;
    this.fetching.next(true);
    this.map = map;
    this.configCoverage = companyCoverageConfig.coverageConfig;
    this.gMapUtils.clearCoverageDataLayers(this.map);

    applyStyleToMapLayers(map);
    this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));
    this.gMapUtils.createCompanyMarkerInfoWindow(this.map);
    if (this.configCoverage.zips.length) {
      this.boundariesService.getSplitZipBoundaries(this.configCoverage.zips, this.constants.BOUNDARIES_SPILT_SIZE)
        .pipe(
          takeUntil(this.destroyed$),
          catchError(err => {
            this.fetching.next(false);
            this.popUpService.showInternalServerError();
            return of(null);
          })
        )
        .subscribe((zipBoundaries: ZipBoundaries | null) => {
            if (zipBoundaries) {
              this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.markAreasZips(zipBoundaries, servedZipCodes));
              this.fetching.next(false);
            }
          }, err => {
            console.log(err);
          },
          () => this.gMapUtils.fitMapToDataLayer(this.map)
        );
    } else {
      this.map.setCenter(new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));
      this.fetching.next(false);
    }

  }

  getZipsByRadius(center: google.maps.LatLng, radius: number): void {
    this.fetching.next(true);
    this.configCoverage.radius = radius;
    this.boundariesService.queryByRadius(center.lat(), center.lng(), radius)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((zipBoundaries: ZipBoundaries) => {
        applyStyleToMapLayers(this.map);
        this.gMapUtils.clearCoverageDataLayers(this.map);
        this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.markAreasZips(zipBoundaries, this.servedZipCodes));
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
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
