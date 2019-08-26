import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { ZipBoundaries } from '../../../../../api/models/ZipBoundaries';
import { CoverageConfig } from '../../../../../api/models/CoverageConfig';
import { of, Subscription, BehaviorSubject, fromEventPattern } from 'rxjs';
import { getErrorMessage } from '../../../../../util/functions';
import { BoundariesService } from '../../../../../api/services/boundaries.service';
import { SecurityService } from '../../../../../auth/security.service';
import { CompanyService } from '../../../../../api/services/company.service';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../../../util/google-map.utils';
import { PopUpMessageService } from '../../../../../util/pop-up-message.service';
import { CompanyCoverageConfig } from '../../../../../api/models/CompanyCoverageConfig';
import { MediaQuery, MediaQueryService } from '../../../../../util/media-query.service';
import { catchError, debounceTime, switchMap, takeWhile, tap } from 'rxjs/internal/operators';


export class ZipInfoWindow {
  trigger: boolean;
  position: {
    lat: any,
    lng: any
  };
  content: string;
}

@Injectable()
export class DetailModeService implements OnDestroy {
  fetching: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  zips: EventEmitter<{ added: Array<string>, removed: Array<string> }> = new EventEmitter<{ added: Array<string>, removed: Array<string> }>();
  onInfoWindow: EventEmitter<ZipInfoWindow> = new EventEmitter<ZipInfoWindow>();

  private _zipsHistory: { added: Array<string>, removed: Array<string> } = {
    added: [],
    removed: []
  };

  set zipsHistory(value: { added: Array<string>; removed: Array<string> }) {
    this._zipsHistory = value;
    this.zips.emit(value);
  }

  get zipsHistory(): { added: Array<string>; removed: Array<string> } {
    return this._zipsHistory;
  }

  mediaQuery: MediaQuery;
  infoWindow: ZipInfoWindow = {
    position: {
      lat: undefined,
      lng: undefined
    },
    trigger: false,
    content: ''
  };
  private map: google.maps.Map;
  private configCoverage: CoverageConfig;
  private idle$: Subscription;
  private boundaries$: Subscription;
  private servedZipCodes: Array<string>;
  private mouseOverListener;
  private mouseLeaveListener;
  private clickListener;
  private mediaQuerySubscription$: Subscription;
  private zipInfoWindow;
  private subscribedMapIdle: boolean = true;

  constructor(private securityService: SecurityService,
              private boundariesService: BoundariesService,
              private companyService: CompanyService,
              private gMapUtils: GoogleMapUtilsService,
              private popUpMessageService: PopUpMessageService,
              public mediaQueryService: MediaQueryService) {
  }

  init(map: google.maps.Map, companyCoverageConfig: CompanyCoverageConfig, servedZipCodes: Array<string>): void {
    this.servedZipCodes = servedZipCodes;
    this.mediaQuerySubscription$ = this.mediaQueryService.screen.subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
    });
    this.fetching.next(true);
    this.map = map;
    this.configCoverage = companyCoverageConfig.coverageConfig;
    this.gMapUtils.clearCoverageDataLayers(this.map);
    applyStyleToMapLayers(map, true);
    this.addAreaListeners();
    this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));
    this.gMapUtils.createCompanyMarkerInfoWindow(this.map);
    this.map.setZoom(10);
    this.map.setCenter(new google.maps.LatLng(companyCoverageConfig.companyLocation.lat, companyCoverageConfig.companyLocation.lng));

    this.subscribedMapIdle = true;

    this.idle$ = fromEventPattern(
      (handler) => {
        return map.addListener('idle', (handler as any));
      },
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      }
    ).pipe(
      takeWhile(() => this.subscribedMapIdle),
      debounceTime(200),
      switchMap(() => {
        this.fetching.next(true);
        const southWest: string = [this.map.getBounds().getSouthWest().lat(), this.map.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.map.getBounds().getNorthEast().lat(), this.map.getBounds().getNorthEast().lng()].join();

        return this.boundariesService.getZipCodesInBbox(northEast, southWest).pipe(
          catchError(err => {
            this.fetching.next(false);
            this.popUpMessageService.showError('Unexpected error during map rendering');

            return of(null);
          }));
      }),
      catchError(err => {
        this.fetching.next(false);
        this.popUpMessageService.showError(getErrorMessage(err));

        return of(null);
      }),
      tap((zipBoundaries: ZipBoundaries) => {
        if(zipBoundaries) {
          this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.zipsToDraw(this.map, zipBoundaries, this.configCoverage.zips, this.servedZipCodes));
        }
        this.fetching.next(false);
      })
    ).subscribe(() => {
    });
  }

  destroy(): void {
    this.gMapUtils.removeCompanyMarker();
    this.gMapUtils.removeCompanyMarkerInfoWindowListeners();
    this.removeAreaListeners();
    if (this.zipsHistory.added.length > 0) {
      this.zipsHistory.added.forEach(zip => {
        this.unSelectMapZip(zip);
      });
    }
    if (this.zipsHistory.removed.length > 0) {
      this.zipsHistory.removed.forEach(zip => {
        this.selectMapZip(zip);
      });
    }
    this.zipsHistory = {
      added: [],
      removed: []
    };
    if (this.boundaries$) {
      this.boundaries$.unsubscribe();
    }
    if (this.mediaQuerySubscription$) {
      this.mediaQuerySubscription$.unsubscribe();
    }
    if (this.idle$) {
      this.idle$.unsubscribe();
      this.subscribedMapIdle = false;
    }
  }

  ngOnDestroy(): void {
    console.log('destroy');
  }

  addRemoveZip(zip: string, undo: boolean = false): void {
    if (zip) {
      if (!this.configCoverage.zips.includes(zip)) {
        if (!this.zipsHistory.added.includes(zip)) {
          this.zipsHistory.added = [...this.zipsHistory.added, zip];
        } else {
          this.zipsHistory.added = this.zipsHistory.added.filter(addedZip => addedZip !== zip);
          undo && this.unSelectMapZip(zip);
        }
      } else {
        if (!this.zipsHistory.removed.includes(zip)) {
          this.zipsHistory.removed = [...this.zipsHistory.removed, zip];
        } else {
          this.zipsHistory.removed = this.zipsHistory.removed.filter(removedZip => removedZip !== zip);
          undo && this.selectMapZip(zip);
        }
      }
      this.zipsHistory = this.zipsHistory;
    }
  }

  private boundaryClickHandler = (event: google.maps.Data.MouseEvent) => {
    this.addRemoveZip(event.feature.getProperty('zip'));
    event.feature.setProperty('selected', !event.feature.getProperty('selected'));
    this.map.data.overrideStyle(event.feature, {
      strokeWeight: 2,
      strokeOpacity: 0.5,
      fillOpacity: 0.55
    });

    this.map.data.revertStyle();
  };

  private boundaryMouseLeaveHandler = (event: google.maps.Data.MouseEvent) => {
    this.infoWindow.trigger = false;
    this.onInfoWindow.emit(this.infoWindow);
    this.zipInfoWindow = null;
    if (this.mediaQuery.xs) {
      return;
    }
    this.map.data.revertStyle();
  };

  private boundaryMouseOverHandler = (event: google.maps.Data.MouseEvent) => {
    const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    event.feature.getGeometry().forEachLatLng((latLng: google.maps.LatLng) => {
      bounds.extend(latLng);
    });
    this.infoWindow = {
      trigger: true,
      position: {lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng()},
      content: event.feature.getProperty('zip')
    };
    this.onInfoWindow.emit(this.infoWindow);
    if (this.mediaQuery.xs) {
      return;
    }
    if (event.feature.getProperty('selected')) {
      this.map.data.overrideStyle(event.feature, {
        strokeWeight: 2,
        fillOpacity: 0.55,
        strokeOpacity: 1
      });
    } else {
      this.map.data.overrideStyle(event.feature, {
        strokeWeight: 2,
        fillOpacity: 0.55,
        strokeOpacity: 1
      });
    }
  };

  private addAreaListeners(): void {
    this.mouseOverListener = this.map.data.addListener('mouseover', this.boundaryMouseOverHandler);
    this.mouseLeaveListener = this.map.data.addListener('mouseout', this.boundaryMouseLeaveHandler);
    this.clickListener = this.map.data.addListener('click', this.boundaryClickHandler);
  }

  private removeAreaListeners(): void {
    google.maps.event.removeListener(this.clickListener);
    google.maps.event.removeListener(this.mouseLeaveListener);
    google.maps.event.removeListener(this.mouseOverListener);
  }

  selectUnSelectZip(zip: string): void {
    this.map.data.forEach(feature => {
      if (feature.getProperty('zip') === zip) {
        const selected = feature.getProperty('selected');
        if (selected) {
          feature.setProperty('selected', false);
          this.map.data.overrideStyle(feature, {
            strokeWeight: 1,
            fillOpacity: 0
          });
        } else {
          feature.setProperty('selected', true);
          this.map.data.overrideStyle(feature, {
            strokeWeight: 2,
            fillOpacity: 0.1
          });
        }

      }
    });
  }

  selectMapZip(zip: string): void {
    this.map.data.forEach(feature => {
      if (feature.getProperty('zip') === zip) {
        feature.setProperty('selected', true);
        this.map.data.overrideStyle(feature, {
          strokeWeight: 2,
          fillOpacity: 0.1
        });
      }
    });
  }

  private unSelectMapZip(zip: string): void {
    this.map.data.forEach(feature => {
      if (feature.getProperty('zip') === zip) {
        feature.setProperty('selected', false);
        this.map.data.overrideStyle(feature, {
          strokeWeight: 1,
          fillOpacity: 0
        });
      }
    });
  }
}
