import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  mergeMap,
  publishReplay,
  refCount,
  skip,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { ZipFeature } from '../../../../../../../../api/models/ZipBoundaries';
import { Constants } from '../../../../../../../../util/constants';
import { getErrorMessage } from '../../../../../../../../util/functions';
import { GoogleMapUtilsService } from '../../../../../../../../util/google-map.utils';
import { MediaQuery, MediaQueryService } from '../../../../../../../../util/media-query.service';
import { PopUpMessageService } from '../../../../../../../../util/pop-up-message.service';
import { ICircleProps } from '../../../../interfaces/circle-props';
import { CircleService } from '../../../../services/circle.service';
import { CoverageService } from '../../../../services/coverage.service';

@Component({
  selector: 'imp-basic-mode',
  templateUrl: './basic-mode.component.html',
  styleUrls: ['../../styles/coverage-modes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicModeComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() radius: number;
  @Input() center;
  @Input() servedZipCodes: string[];

  @Output() readonly circlePropsUpdated = new EventEmitter<ICircleProps>();

  coverageRadiusStep: number;
  minCoverageRadius: number;
  maxCoverageRadius: number;
  miles: number[];
  media$: Observable<MediaQuery>;
  zipCode: string;

  @ViewChild('zipCodeControl') private zipCodeControl: NgModel;

  private readonly destroyed$ = new Subject<void>();

  constructor(private mediaQuery: MediaQueryService,
              private circleService: CircleService,
              private constants: Constants,
              private changeDetectorRef: ChangeDetectorRef,
              private coverageService: CoverageService,
              private popUpService: PopUpMessageService,
              private gMapUtil: GoogleMapUtilsService) {

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.minCoverageRadius = this.constants.MIN_COVERAGE_RADIUS;
    this.maxCoverageRadius = this.constants.MAX_COVERAGE_RADIUS;
    this.coverageRadiusStep = this.constants.COVERAGE_RADIUS_STEP;
    this.miles = Array.from(
      Array((this.maxCoverageRadius - this.minCoverageRadius) + 1).keys(),
    ).map((i) => this.minCoverageRadius + i);

    this.media$ = this.mediaQuery.screen
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        publishReplay(1),
        refCount(),
      );
  }

  ngAfterViewInit(): void {
    this.circlePropsChangeEffect();
  }

  setCompanyCenter(zipCodeControl: NgModel): void {
    if (!zipCodeControl.valid) {
      return;
    }
    const zipCode = zipCodeControl.value;
    if (!zipCode.length) {
      this.popUpService.showError(`Please enter a zip code`);
      return;
    }
    if (!this.servedZipCodes.includes(zipCode)) {
      this.popUpService.showWarning(`${zipCode} doesn't supported`);
      return;
    }
    zipCodeControl.reset();
    zipCodeControl.control.setErrors(null);
    this.getZipFeature(zipCode);
  }

  radiusChange(radiusControl: NgModel): void {
    if (radiusControl.valid) {
      const center = this.circleService.center;
      this.circleService.update(this.radius, center);
    }
  }

  private getZipFeature(zipCode: string): void {
    this.coverageService.fetching$.next(true);
    this.coverageService.findZipBoundariesByZipCode(zipCode)
      .pipe(
        takeUntil(this.destroyed$),
      ).subscribe((zipFeature: ZipFeature) => {
        this.coverageService.fetching$.next(false);
        const center = this.gMapUtil.getPolygonBounds(zipFeature.geometry.coordinates).getCenter();
        this.circleService.update(this.radius, center);
        this.circleService.circleChangeTrigger$.next(center);
      },
      (err) => {
        this.coverageService.fetching$.next(false);
        this.popUpService.showError(getErrorMessage(err));
      });
  }

  private circlePropsChangeEffect(): void {
    this.circleService.circleCreated$.asObservable()
      .pipe(
        mergeMap((res) => {
          if (!res) {
            return of(null);
          }
          return combineLatest([
            this.circleService.centerChanged$.pipe(startWith(this.center as google.maps.LatLng)),
            this.circleService.radiusChanged$.pipe(startWith(this.radius)),
          ]);
        }),
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
      ).subscribe((data: [google.maps.LatLng, number] | null) => {
      if (!data) {
        return;
      }
      const [center, radius] = data;
      this.radius = radius;
      this.circlePropsUpdated.emit({center, radius} as ICircleProps);
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    });
  }
}
