import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { BoundariesService } from '../../../api/services/boundaries.service';

import { catchError, debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, fromEventPattern, of, Subject } from 'rxjs';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google-map.utils';
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';
import { getErrorMessage } from '../../../util/functions';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { Constants } from '../../../util/constants';
import { CountyBoundaries, CountyMapArea } from "../../../api/models/CountyBoundaries";
import { ZipInfoWindow } from '../../settings/contractor-account/service-area/interfaces/zip-info-window';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
  selector: 'admin-map',
  template: '',
  styles: []
})
export class AdminMap implements OnDestroy {
  @Output() loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Output() areas: EventEmitter<{ added: Array<CountyMapArea>, removed: Array<CountyMapArea> }> = new EventEmitter<{ added: Array<CountyMapArea>, removed: Array<CountyMapArea> }>();
  @Output() onInfoWindow: EventEmitter<ZipInfoWindow> = new EventEmitter<ZipInfoWindow>();
  @Output() hasChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  NEW_YORK_COORDINATES = { lat: 40.730610, lng: -73.935242 };
  MAP_MIN_ZOOM = 7;

  mediaQuery: MediaQuery;
  infoWindow: ZipInfoWindow = {
    position: {lat: undefined, lng: undefined},
    trigger: false,
    content: ''
  };

  private _areaHistory: { added: Array<CountyMapArea>, removed: Array<CountyMapArea> } = {
    added: [],
    removed: []
  };

  set areaHistory(value: { added: Array<CountyMapArea>; removed: Array<CountyMapArea> }) {
    this._areaHistory = value;
    this.areas.emit(value);
    this.hasChanges.emit(!(this.areaHistory.added.length == 0 && this.areaHistory.removed.length == 0));
  }

  get areaHistory(): { added: Array<CountyMapArea>; removed: Array<CountyMapArea> } {
    return this._areaHistory;
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
    this.loading.next(true);
    fromPromise(this.googleMapsAPIWrapper.getNativeMap()).pipe(
      takeUntil(this.destroyed$),
      finalize(() => this.loading.next(false)),
      switchMap(map => {
        this.map = map;
        applyStyleToMapLayers(map, true);
        return this.boundariesService.getCountyBoundaries(this.coveredArea);
      }),
      switchMap( (coverage: CountyBoundaries) => {
        this.gMapUtils.clearAllDataLayers(this.map);
        this.drawCoverage(coverage);
        this.addAreaListeners();
        // this.gMapUtils.fitMapToDataLayer(this.map);
        this.map.setZoom(this.MAP_MIN_ZOOM);

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
        const southWest: string = [this.map.getBounds().getSouthWest().lat(), this.map.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.map.getBounds().getNorthEast().lat(), this.map.getBounds().getNorthEast().lng()].join();

        return this.boundariesService.getCountiesInBbox(northEast, southWest).pipe(
          catchError(err => {
            this.popUpMessageService.showError('Unexpected error during map rendering');
            return of(null);
          }));
      }),
      catchError(err => {
        this.popUpMessageService.showError(getErrorMessage(err));
        return of(null);
      })
    ).subscribe((countyBoundaries: CountyBoundaries) => {
      if (countyBoundaries) {
        this.gMapUtils.drawCountyBoundaries(this.map, this.gMapUtils.countiesToDraw(this.map, countyBoundaries, this.coveredArea));
      }
    });
  }

  drawCoverage(coverage) {
    this.gMapUtils.drawAreasCounties(this.map, coverage);
    // this.gMapUtils.fitMapToCoverage(this.map);
  }


  private boundaryClickHandler = (event: google.maps.Data.MouseEvent) => {
    this.addRemovedArea(new CountyMapArea(event.feature.getId(),
      event.feature.getProperty('name'),
      event.feature.getProperty('state')));
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
      content: event.feature.getProperty('name')
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

  addRemovedArea(area: CountyMapArea, undo: boolean = false): void {
    console.log(area, this.coveredArea, this.areaHistory.added)
    if (area) {
      if (!this.coveredArea.includes(area.id)) {
        if (this.areaHistory.added.every(e => e.id !== area.id)) {
          this.areaHistory.added = [...this.areaHistory.added, area];
        } else {
          this.areaHistory.added = this.areaHistory.added.filter(addedArea => addedArea.id !== area.id);
          undo && this.unSelectMapArea(area);
        }
      } else {
        if (this.areaHistory.removed.every(e => e.id !== area.id)) {
          this.areaHistory.removed = [...this.areaHistory.removed, area];
        } else {
          this.areaHistory.removed = this.areaHistory.removed.filter(removedArea => removedArea.id !== area.id);
          undo && this.selectMapArea(area);
        }
      }
      this.areaHistory = this.areaHistory;
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

  selectMapArea(area: CountyMapArea): void {
    this.map.data.forEach(feature => {
      if (feature.getId() === area.id) {
        feature.setProperty('selected', true);
        this.map.data.overrideStyle(feature, {
          strokeWeight: 2,
          fillOpacity: 0.1
        });
      }
    });
  }

  private unSelectMapArea(area: CountyMapArea): void {
    this.map.data.forEach(feature => {
      if (feature.getId() === area.id) {
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
    if (this.areaHistory.added.length > 0) {
      this.areaHistory.added.forEach(area => {
        this.unSelectMapArea(area);
      });
    }
    if (this.areaHistory.removed.length > 0) {
      this.areaHistory.removed.forEach(area => {
        this.selectMapArea(area);
      });
    }
    this.areaHistory = {
      added: [],
      removed: []
    };
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  refresh() {
    this.areaHistory = {added: [], removed: []};
    this.hasChanges.emit(false);
  }
}
