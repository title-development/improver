import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, fromEventPattern, merge, Observable, of, Subject, zip } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mapTo,
  mergeMap,
  skip,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Constants } from '../../../../../util/constants';
import { GoogleMapUtilsService } from '../../../../../util/google-map.utils';
import { CoverageService } from './coverage.service';


@Injectable()
export class CircleService implements OnDestroy {
  get radiusInMiles(): number | never {
    if (!this.circle) {
      throw new Error('Circle did not init');
    }
    return this.metersToMiles(this.circle.getRadius());
  }

  get center(): google.maps.LatLng | never {
    if (!this.circle) {
      throw new Error('Circle did not init');
    }
    return this.circle.getCenter();
  }

  radiusChanged$: Observable<number>;
  centerChanged$: Observable<google.maps.LatLng>;
  readonly circleCreated$ = new BehaviorSubject<boolean>(false);
  readonly circleChangeTrigger$ = new Subject<google.maps.LatLng>();

  private circle: google.maps.Circle | null;

  private readonly destroyed$ = new Subject<void>();

  constructor(private constants: Constants,
              private gMapUtils: GoogleMapUtilsService,
              private coverageService: CoverageService) {
  }

  init(gMap: google.maps.Map, radiusInMiles: number, center: google.maps.LatLng): void {
    if (!this.circle) {
      const radiusInMeters = this.milesToMeters(radiusInMiles);
      this.circle = this.gMapUtils.drawCircle(gMap, radiusInMeters, center, {editable: true, draggable: true});
      this.onCircleRadiusChanged();
      this.onCircleCenterChanged();
      this.disableCircleWhileLoading();
      this.circleCreated$.next(true);
    } else {
      this.circle.setMap(gMap);
      this.update(radiusInMiles, center);
      this.circleChangeTrigger$.next(center);
    }
  }

  clearCircle(): void {
    if (this.circle) {
      this.circle.setMap(null);
    }
  }

  update(radiusInMiles: number, center: google.maps.LatLng): void {
    const radiusInMeters = this.milesToMeters(radiusInMiles);
    this.circle.setCenter(center);
    this.circle.setRadius(radiusInMeters);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.circleChangeTrigger$.complete();
  }

  // Disable circle radius change or drag while something is loading
  private disableCircleWhileLoading(): void {
    this.coverageService.fetching$.asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((isLoading) => {
        if (!this.circle) {
          return;
        }
        if (isLoading) {
          this.circle.setEditable(false);
          this.circle.setDraggable(false);
        } else {
          this.circle.setEditable(true);
          this.circle.setDraggable(true);
        }
      });
  }

  private onCircleCenterChanged() {
    const centerChangedEvent$ = fromEventPattern<number>(
      (handler) => {
        return google.maps.event.addListener(this.circle, 'center_changed', (handler as any));
      },
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      }).pipe(mapTo('centerChanged'));
    const dragEvent$ = fromEventPattern<number>(
      (handler) => {
        return google.maps.event.addListener(this.circle, 'drag', (handler as any));
      },
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      }).pipe(mapTo('drag'));
    const dragEndEvent$ = fromEventPattern<number>(
      (handler) => {
        return google.maps.event.addListener(this.circle, 'dragend', (handler as any));
      },
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      }).pipe(mapTo('dragend'));

    this.centerChanged$ = merge(
      combineLatest([
          dragEndEvent$.pipe(startWith(new Date()), map(() => new Date())),
          zip(centerChangedEvent$, dragEvent$).pipe(startWith(new Date()), map(() => new Date())),
          centerChangedEvent$.pipe(startWith(new Date()), map(() => new Date())),
        ],
      ).pipe(
        skip(1),
        debounceTime(100),
        mergeMap(([one, two, three]: [Date, Date, Date]) => {
          if (one > two && one > three) {
            return of('drag end');
          } else if (three > two && three > one) {
            return of('center control changed');
          } else {
            return EMPTY;
          }
        }),
      ),

      this.circleChangeTrigger$,
    )
      .pipe(
        debounceTime(200),
        map(() => this.circle.getCenter()),
        distinctUntilChanged(),
      );
  }

  private onCircleRadiusChanged(): void {
    this.radiusChanged$ = fromEventPattern<number>(
      (handler) => {
        return google.maps.event.addListener(this.circle, 'radius_changed', (handler as any));
      },
      (handler, listener) => {
        google.maps.event.removeListener(listener);
      })
      .pipe(
        startWith(this.circle.getRadius()),
        map(() => this.circle.getRadius()),
        map((radiusMeters) => this.mathRoundByCoverageStep(radiusMeters)),
        skip(1),
        tap((radiusMiles) => this.updateRadius(radiusMiles)),
      );

  }

  private milesToMeters(milesRadius: number): number {
    return milesRadius * this.constants.METERS_IN_MILES;
  }

  private metersToMiles(metersRadius: number): number {
    return metersRadius / this.constants.METERS_IN_MILES;
  }

  private mathRoundByCoverageStep(radiusInMeters: number): number {
    const radiusInMiles: number = this.metersToMiles(radiusInMeters);
    let radius = radiusInMiles.clamp(this.constants.MIN_COVERAGE_RADIUS, this.constants.MAX_COVERAGE_RADIUS);
    return Math.ceil( radius / this.constants.COVERAGE_RADIUS_STEP) * this.constants.COVERAGE_RADIUS_STEP;
  }

  private updateRadius(radiusInMiles: number): void {
    const radiusInMeters = this.milesToMeters(radiusInMiles);
    this.circle.setRadius(radiusInMeters);
  }
}
