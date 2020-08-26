import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { CompanyCoverageConfig } from '../../../../../api/models/CompanyCoverageConfig';
import { CoverageConfig } from '../../../../../api/models/CoverageConfig';
import { ZipBoundaries } from '../../../../../api/models/ZipBoundaries';
import { BoundariesService } from '../../../../../api/services/boundaries.service';
import { Constants } from '../../../../../util/constants';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../../../util/google/google-map.utils';
import { PopUpMessageService } from '../../../../../api/services/pop-up-message.service';
import { CircleService } from './circle.service';
import { CoverageService } from './coverage.service';

@Injectable()
export class BasicModeService implements OnDestroy {
  get coverageConfig(): CoverageConfig {
    const zips = this.newCoverageArea.filter((zip) => this.servedZipCodes.includes(zip));
    const center = this.circleService.center;
    const radius = this.circleService.radiusInMiles;
    return new CoverageConfig(center.lat(), center.lng(), false, radius, zips);
  }

  private gMap: google.maps.Map;
  private servedZipCodes: string[];
  private _coverageConfig: CoverageConfig;
  private newCoverageArea: string[];
  private readonly destroyed$ = new Subject<void>();

  constructor(private gMapUtils: GoogleMapUtilsService,
              private boundariesService: BoundariesService,
              private popUpService: PopUpMessageService,
              private constants: Constants,
              private circleService: CircleService,
              private coverageService: CoverageService) {

  }

  init(gMap: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig, servedZipCodes: string[]): void {
    this.coverageService.fetching$.next(true);
    this.setState(gMap, servedZipCodes, companyCoverageConfig);
    this.initCoverageCircle(gMap, companyCoverageConfig);
    this.initMarkers(gMap, companyCoverageConfig.getCompanyLocationCenter());
    applyStyleToMapLayers(gMap);
    if (!this._coverageConfig.zips.length) {
      this.gMap.setCenter(companyCoverageConfig.getCompanyLocationCenter());
      this.coverageService.fetching$.next(false);
      return;
    }
    this.getZipBoundaries();
    this.coverageService.unsavedChanges$.next(false);
  }

  getZipsByRadiusAndDraw(center: google.maps.LatLng, radius: number): Observable<ZipBoundaries> {
    this.coverageService.fetching$.next(true);
    this._coverageConfig.radius = radius = Math.round(radius);
    return this.boundariesService.queryByRadius(center.lat(), center.lng(), radius).pipe(
      catchError((err) => {
        this.popUpService.showInternalServerError();
        return of(null);
      }),
      takeUntil(this.destroyed$),
      finalize(() => this.coverageService.fetching$.next(false)),
      tap((zipBoundaries: ZipBoundaries | null) => {
        if (!zipBoundaries) {
          return;
        }
        this.gMapUtils.clearCoverageDataLayers(this.gMap);
        this.gMapUtils.drawZipBoundaries(this.gMap, this.gMapUtils.markAreasZips(zipBoundaries, this.servedZipCodes));
        this.gMap.setCenter(center);
        this.newCoverageArea = zipBoundaries.features
          .map((feature) => feature.properties.zip)
          .filter(zipCode => this.servedZipCodes.includes(zipCode));
        this.isHasUnsavedChanges();
      })
    );
  }

  destroyMode(): void {
    this.gMapUtils.removeCompanyMarker();
    this.gMapUtils.removeCompanyMarkerInfoWindow();
    this.circleService.clearCircle();
    this.destroyed$.next();
  }

  ngOnDestroy(): void {
    this.destroyMode();
    this.destroyed$.complete();
  }

  private isHasUnsavedChanges(): void {
    if (this.newCoverageArea.length != this._coverageConfig.zips.length) {
      this.coverageService.unsavedChanges$.next(true);
      return;
    }
    const changes = this._coverageConfig.zips.filter(zipCode => !this.newCoverageArea.includes(zipCode));
    this.coverageService.unsavedChanges$.next(!!changes.length);
  }

  private getZipBoundaries(): void {
    this.gMapUtils.clearCoverageDataLayers(this.gMap);
    this.boundariesService.getSplitZipBoundaries(this._coverageConfig.zips, this.constants.ZIPCODES_BATCH_SIZE)
      .pipe(
        catchError((err) => {
          this.popUpService.showInternalServerError();

          return of(null);
        }),
        takeUntil(this.destroyed$),
        finalize(() => this.coverageService.fetching$.next(false)),
      )
      .subscribe((zipBoundaries: ZipBoundaries | null) => {
          if (!zipBoundaries) {
            return;
          }
          this.gMapUtils.drawZipBoundaries(this.gMap, this.gMapUtils.markAreasZips(zipBoundaries, this.servedZipCodes));
        }, err => {
          console.error(err);
        },
        () => this.gMapUtils.fitMapToDataLayer(this.gMap),
      );
  }

  private initMarkers(gMap: google.maps.Map, center: google.maps.LatLng): void {
    this.gMapUtils.drawCompanyMarker(gMap, center);
    this.gMapUtils.createCompanyMarkerInfoWindow(gMap);
  }

  private initCoverageCircle(gMap: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig): void {
    this.circleService.clearCircle();
    this.circleService.init(gMap, this._coverageConfig.radius, companyCoverageConfig.getCompanyCoverageCenter());
  }

  private setState(gMap: google.maps.Map, servedZipCodes: string[], companyCoverageConfig: CompanyCoverageConfig): void {
    this.gMap = gMap;
    this.servedZipCodes = servedZipCodes.slice();
    this._coverageConfig = {...companyCoverageConfig.coverageConfig};
  }

  public setCoverageConfig(coverageConfig: CoverageConfig) {
    this._coverageConfig = coverageConfig;
  }

}
