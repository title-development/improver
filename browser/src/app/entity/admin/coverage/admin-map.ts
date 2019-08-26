import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { BoundariesService } from '../../../api/services/boundaries.service';

import { fromPromise } from 'rxjs-compat/observable/fromPromise';
import { catchError, debounceTime, first, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEventPattern, Observable, of, Subject, Subscription } from 'rxjs';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google-map.utils';
import { ZipBoundaries } from '../../../api/models/ZipBoundaries';
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';
import { ZipInfoWindow } from '../../settings/contractor-account/service-area/services/detail-mode.service';
import { getErrorMessage } from '../../../util/functions';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { Constants } from '../../../util/constants';

@Component({
  selector: 'admin-map',
  template: '',
  styles: []
})
export class AdminMap implements OnDestroy {
  @Output() fetching: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Output() zips: EventEmitter<{ added: Array<string>, removed: Array<string> }> = new EventEmitter<{ added: Array<string>, removed: Array<string> }>();
  @Output() onInfoWindow: EventEmitter<ZipInfoWindow> = new EventEmitter<ZipInfoWindow>();
  @Output() hasChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
  mediaQuery: MediaQuery;
  infoWindow: ZipInfoWindow = {
    position: {lat: undefined, lng: undefined},
    trigger: false,
    content: ''
  };

  private _zipsHistory: { added: Array<string>, removed: Array<string> } = {
    added: [],
    removed: []
  };

  set zipsHistory(value: { added: Array<string>; removed: Array<string> }) {
    this._zipsHistory = value;
    this.zips.emit(value);
    this.hasChanges.emit(!(this.zipsHistory.added.length == 0 && this.zipsHistory.removed.length == 0));
  }

  get zipsHistory(): { added: Array<string>; removed: Array<string> } {
    return this._zipsHistory;
  }
  coveredArea: Array<string>;
  private map;
  private mouseOverListener;
  private mouseLeaveListener;
  private clickListener;
  private readonly destroyed$ = new Subject<void>();

  constructor(private googleMapsAPIWrapper: GoogleMapsAPIWrapper,
              private boundariesService: BoundariesService,
              private gMapUtils: GoogleMapUtilsService,
              private popUpMessageService: PopUpMessageService,
              private mediaQueryService: MediaQueryService,
              private constants: Constants) {
    this.mediaQueryService.screen.pipe(takeUntil(this.destroyed$)).subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
    });
  }

  init(coveredArea: Array<string>) {
    this.coveredArea = coveredArea;
    this.fetching.next(true);
    fromPromise(this.googleMapsAPIWrapper.getNativeMap()).pipe(
      takeUntil(this.destroyed$),
      switchMap(map => {
        this.map = map;
        applyStyleToMapLayers(map, true);

        return this.boundariesService.getSplitZipBoundaries(this.coveredArea, this.constants.BOUNDARIES_SPILT_SIZE);
      }),
      switchMap( (coverage: ZipBoundaries) => {
        this.gMapUtils.clearAllDataLayers(this.map);
        this.drawCoverage(coverage);
        this.addAreaListeners();
        this.gMapUtils.fitMapToDataLayer(this.map);
        this.map.setZoom(9);

        return fromEventPattern(
          (handler) => {
            return this.map.addListener('idle', (handler as any));
          },
          (handler, listener) => {
            google.maps.event.removeListener(listener);
          });
      }),
      debounceTime(200),
      switchMap(event => {
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
        this.gMapUtils.drawBoundaries(this.map, this.gMapUtils.zipsToDraw(this.map, zipBoundaries, this.coveredArea));
        this.fetching.next(false);
      })
    ).subscribe(() => {

    });
  }

  drawCoverage(coverage) {
    this.gMapUtils.drawAreasZips(this.map, coverage);
    this.gMapUtils.fitMapToCoverage(this.map);
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
    // this.infoWindow.trigger = false;
    // this.onInfoWindow.emit(this.infoWindow);
    // this.zipInfoWindow = null;
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

  addRemoveZip(zip: string, undo: boolean = false): void {
    if (zip) {
      if (!this.coveredArea.includes(zip)) {
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

  private removeAreaListeners(): void {
    google.maps.event.removeListener(this.clickListener);
    google.maps.event.removeListener(this.mouseLeaveListener);
    google.maps.event.removeListener(this.mouseOverListener);
  }


  private addAreaListeners(): void {
    this.mouseOverListener = this.map.data.addListener('mouseover', this.boundaryMouseOverHandler);
    this.mouseLeaveListener = this.map.data.addListener('mouseout', this.boundaryMouseLeaveHandler);
    this.clickListener = this.map.data.addListener('click', this.boundaryClickHandler);
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

  ngOnDestroy() {
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
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  refresh() {
    this.zipsHistory = {added: [], removed: []};
    this.hasChanges.emit(false);
  }
}
