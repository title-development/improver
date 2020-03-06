import { Injectable, OnDestroy } from '@angular/core';
import { fromEventPattern, of, Subject } from 'rxjs';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';
import { catchError, debounceTime, mergeMap, takeUntil } from 'rxjs/operators';
import { CompanyCoverageConfig } from '../../../../../api/models/CompanyCoverageConfig';
import { CoverageConfig } from '../../../../../api/models/CoverageConfig';
import { ZipBoundaries } from '../../../../../api/models/ZipBoundaries';
import { BoundariesService } from '../../../../../api/services/boundaries.service';
import { CompanyService } from '../../../../../api/services/company.service';
import { SecurityService } from '../../../../../auth/security.service';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../../../util/google-map.utils';
import { MediaQuery, MediaQueryService } from '../../../../../util/media-query.service';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { IZipCodeProps } from '../interfaces/zip-code-props';
import { ZipInfoWindow } from '../interfaces/zip-info-window';
import { ZipHistory } from '../models/zip-history';
import { CoverageService } from './coverage.service';
import { MapOptions } from "@agm/core/services/google-maps-types";
import { defaultMapOptions } from "../../../../../util/google-map-default-options";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class DetailModeService implements OnDestroy {

  get coverageConfig(): CoverageConfig {
    const zips = this._coverageConfig.zips
      .filter((zip) => !this.zipsHistory.removed.some((removedZip) => removedZip == zip))
      .concat(this.zipsHistory.added);

    return new CoverageConfig(this._coverageConfig.centerLat, this._coverageConfig.centerLng, true, this._coverageConfig.radius, zips);
  }

  set zipsHistory(zipHistory: ZipHistory) {
    this._zipsHistory = zipHistory;
    this.coverageService.unsavedChanges$.next(zipHistory.isHasHistory());
    this.zipHistoryChange$.next(zipHistory);
  }

  get zipsHistory(): ZipHistory {
    return this._zipsHistory;
  }

  zipHistoryChange$ = new Subject<ZipHistory>();
  infoWindowChange$ = new Subject<ZipInfoWindow>();

  private mediaQuery: MediaQuery;
  private infoWindow: ZipInfoWindow = {
    position: {
      lat: undefined,
      lng: undefined,
    },
    trigger: false,
    content: '',
  };

  private _zipsHistory: ZipHistory = new ZipHistory([], []);
  private gMap: google.maps.Map;
  private readonly mapOptions: MapOptions = defaultMapOptions;
  private readonly badRequestServerError = 400;
  private _coverageConfig: CoverageConfig;
  private servedZipCodes: string[];
  private mouseOverListener;
  private mouseLeaveListener;
  private clickListener;
  private readonly destroyed$ = new Subject<void>();

  constructor(private securityService: SecurityService,
              private boundariesService: BoundariesService,
              private companyService: CompanyService,
              private gMapUtils: GoogleMapUtilsService,
              private popUpMessageService: PopUpMessageService,
              private mediaQueryService: MediaQueryService,
              private coverageService: CoverageService) {
  }

  init(gMap: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig, servedZipCodes: string[]): void {
    this.coverageService.fetching$.next(true);
    this.setState(servedZipCodes, gMap, companyCoverageConfig);
    this.subscribeForMediaScreen();
    this.addAreaListeners();
    this.initMarkers(companyCoverageConfig.getCompanyLocationCenter());
    applyStyleToMapLayers(gMap, true);
    this.gMap.setZoom(10);
    this.gMap.setCenter(companyCoverageConfig.getCompanyLocationCenter());
    this.getZipBoundaries(gMap);
    this.coverageService.unsavedChanges$.next(false);
}

  destroyMode(): void {
    this.destroyed$.next();
    this.gMapUtils.removeCompanyMarker();
    this.gMapUtils.removeCompanyMarkerInfoWindow();
    this.removeAreaListeners();
    if (this.zipsHistory.added.length) {
      this.zipsHistory.added.forEach((zip) => {
        this.unSelectMapZip(zip);
      });
    }
    if (this.zipsHistory.removed.length) {
      this.zipsHistory.removed.forEach((zip) => {
        this.selectMapZip(zip);
      });
    }
    this.clearZipHistory();
  }

  ngOnDestroy(): void {
    this.destroyMode();
    this.destroyed$.complete();
  }

  existInAddedHistory(zipCode: string): boolean {
    return this.zipsHistory.added.includes(zipCode);
  }

  addZipCode(zipCodeProps: IZipCodeProps): void {
    const zipCode = zipCodeProps.zipCode;
    const coordinates = zipCodeProps.zipFeature.geometry.coordinates;
    const center = this.gMapUtils.getPolygonBounds(coordinates).getCenter();

    this.gMap.setCenter(center);
    this.gMap.setZoom(13);
    this.gMapUtils.drawZipBoundaries(this.gMap, [zipCodeProps.zipFeature]);
    this.toggleZipCodeInHistory(zipCode);
    this.gMapUtils.highlightZip(this.gMap, zipCode, 3000, () => {
      this.selectMapZip(zipCode);
    });
  }

  clearZipHistory(): void {
    this.zipsHistory = new ZipHistory([], []);
  }

  toggleZipCodeInHistory(zip: string, undo: boolean = false): void {
    let added = this.zipsHistory.added;
    let removed = this.zipsHistory.removed;
    if (!zip) {
      return;
    }
    if (!this._coverageConfig.zips.includes(zip)) {
      if (!this.zipsHistory.added.includes(zip)) {
        added = [...this.zipsHistory.added, zip];
      } else {
        added = this.zipsHistory.added.filter((addedZip) => addedZip !== zip);
        if (undo) {
          this.unSelectMapZip(zip);
        }
      }
    } else {
      if (!this.zipsHistory.removed.includes(zip)) {
        removed = [...this.zipsHistory.removed, zip];
      } else {
        removed = this.zipsHistory.removed.filter((removedZip) => removedZip !== zip);
        if (undo) {
          this.selectMapZip(zip);
        }
      }
    }
    this.zipsHistory = new ZipHistory(added, removed);
  }

  private selectMapZip(zip: string): void {
    this.gMap.data.forEach((feature) => {
      if (feature.getProperty('zip') === zip) {
        feature.setProperty('selected', true);
        this.gMap.data.overrideStyle(feature, {
          strokeWeight: 2,
          fillOpacity: 0.1,
        });
      }
    });
  }

  private unSelectMapZip(zip: string): void {
    this.gMap.data.forEach((feature) => {
      if (feature.getProperty('zip') === zip) {
        feature.setProperty('selected', false);
        this.gMap.data.overrideStyle(feature, {
          strokeWeight: 1,
          fillOpacity: 0,
        });
      }
    });
  }

  private getZipBoundaries(gMap: google.maps.Map): void {
    this.gMapUtils.clearCoverageDataLayers(this.gMap);
    fromEventPattern(
      (handler: NodeEventHandler) => gMap.addListener('idle', handler),
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      },
    ).pipe(
      debounceTime(100),
      mergeMap(() => {
        this.coverageService.fetching$.next(true);
        const southWest: string = [this.gMap.getBounds().getSouthWest().lat(), this.gMap.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.gMap.getBounds().getNorthEast().lat(), this.gMap.getBounds().getNorthEast().lng()].join();

        return this.boundariesService.getZipCodesInBbox(northEast, southWest).pipe(
          catchError((err) => {
            if (err instanceof HttpErrorResponse && err.status == this.badRequestServerError) {
              let correctZoom = this.gMap.getZoom() + 1;
              this.gMap.setZoom(correctZoom);
              this.mapOptions.minZoom = correctZoom;
            } else {
              this.popUpMessageService.showError('Unexpected error during gMap rendering');
            }

            return of(null);
          }));
      }),
      takeUntil(this.destroyed$),
    ).subscribe((zipBoundaries: ZipBoundaries | null) => {
      if (!zipBoundaries) {
        this.coverageService.fetching$.next(false);
        return;
      }
      const zipFeatures = this.gMapUtils.zipsToDraw(this.gMap, zipBoundaries, this._coverageConfig.zips, this.servedZipCodes);
      this.gMapUtils.drawZipBoundaries(this.gMap, zipFeatures);
      this.coverageService.fetching$.next(false);
    });
  }

  private subscribeForMediaScreen(): void {
    this.mediaQueryService.screen.asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mediaQuery: MediaQuery) => {
        this.mediaQuery = mediaQuery;
      });
  }

  private initMarkers(companyCenter: google.maps.LatLng): void {
    this.gMapUtils.drawCompanyMarker(this.gMap, companyCenter);
    this.gMapUtils.createCompanyMarkerInfoWindow(this.gMap);
  }

  private setState(servedZipCodes: string[], gMap: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig) {
    this.gMap = gMap;
    this.servedZipCodes = servedZipCodes.slice();
    this._coverageConfig = {...companyCoverageConfig.coverageConfig};
  }

  private boundaryClickHandler = (event: google.maps.Data.MouseEvent) => {
    this.toggleZipCodeInHistory(event.feature.getProperty('zip'));
    event.feature.setProperty('selected', !event.feature.getProperty('selected'));
    this.gMap.data.overrideStyle(event.feature, {
      strokeWeight: 2,
      strokeOpacity: 0.5,
      fillOpacity: 0.55,
    });

    this.gMap.data.revertStyle();
  }

  private boundaryMouseLeaveHandler = (event: google.maps.Data.MouseEvent) => {
    this.infoWindow.trigger = false;
    this.infoWindowChange$.next({...this.infoWindow});
    if (this.mediaQuery.xs) {
      return;
    }
    this.gMap.data.revertStyle();
  }

  private boundaryMouseOverHandler = (event: google.maps.Data.MouseEvent) => {
    const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    event.feature.getGeometry().forEachLatLng((latLng: google.maps.LatLng) => {
      bounds.extend(latLng);
    });
    this.infoWindow = {
      trigger: true,
      position: {lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng()},
      content: event.feature.getProperty('zip'),
    };
    this.infoWindowChange$.next({...this.infoWindow});
    if (this.mediaQuery.xs) {
      return;
    }
    if (event.feature.getProperty('selected')) {
      this.gMap.data.overrideStyle(event.feature, {
        strokeWeight: 2,
        fillOpacity: 0.55,
        strokeOpacity: 1,
      });
    } else {
      this.gMap.data.overrideStyle(event.feature, {
        strokeWeight: 2,
        fillOpacity: 0.55,
        strokeOpacity: 1,
      });
    }
  }

  private addAreaListeners(): void {
    this.mouseOverListener = this.gMap.data.addListener('mouseover', this.boundaryMouseOverHandler);
    this.mouseLeaveListener = this.gMap.data.addListener('mouseout', this.boundaryMouseLeaveHandler);
    this.clickListener = this.gMap.data.addListener('click', this.boundaryClickHandler);
  }

  private removeAreaListeners(): void {
    google.maps.event.removeListener(this.clickListener);
    google.maps.event.removeListener(this.mouseLeaveListener);
    google.maps.event.removeListener(this.mouseOverListener);
  }
}
