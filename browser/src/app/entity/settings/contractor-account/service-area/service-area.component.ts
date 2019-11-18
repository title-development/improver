import { AgmMap } from '@agm/core';
import { MapOptions } from '@agm/core/services/google-maps-types';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { CoverageConfig } from '../../../../api/models/CoverageConfig';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { CompanyService } from '../../../../api/services/company.service';
import { SecurityService } from '../../../../auth/security.service';
import { defaultMapOptions, mapStyle } from '../../../../util/google-map-default-options';
import { GoogleMapUtilsService } from '../../../../util/google-map.utils';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';

import {
  distinctUntilChanged,
  finalize,
  mergeMap,
  publishReplay,
  refCount,
  repeatWhen,
  takeUntil,
} from 'rxjs/internal/operators';
import { CompanyCoverageConfig } from '../../../../api/models/CompanyCoverageConfig';
import { ZipBoundaries } from '../../../../api/models/ZipBoundaries';
import { TutorialsService } from '../../../../api/services/tutorials.service';
import { ComponentCanDeactivate } from '../../../../auth/router-guards/component-can-deactivate.guard';
import { getErrorMessage } from '../../../../util/functions';
import { MediaQuery, MediaQueryService } from '../../../../util/media-query.service';
import { ICircleProps } from './interfaces/circle-props';
import { IZipCodeProps } from './interfaces/zip-code-props';
import { ZipInfoWindow } from './interfaces/zip-info-window';
import { ZipHistory } from './models/zip-history';
import { BasicModeService } from './services/basic-mode.service';
import { CircleService } from './services/circle.service';
import { CoverageService } from './services/coverage.service';
import { DetailModeService } from './services/detail-mode.service';

@Component({
  selector: 'imp-service-area',
  templateUrl: './service-area.component.html',
  styleUrls: ['./service-area.component.scss'],
  viewProviders: [
    CoverageService,
    CircleService,
    BasicModeService,
    DetailModeService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceAreaComponent implements OnDestroy, ComponentCanDeactivate, AfterViewInit, OnInit {

  @ViewChild(AgmMap) agmMap: AgmMap;

  isSavingChanges: boolean = false;
  zipsHistory: ZipHistory;
  mapOptions: MapOptions = defaultMapOptions;
  mapStyles = mapStyle;
  infoWindow: ZipInfoWindow;
  servedZipCodes: string[];
  companyCoverageConfig: CompanyCoverageConfig;
  fetching$: Observable<boolean>;
  unsavedChanges$: Observable<boolean>;
  mediaQuery: MediaQuery;

  get isDetailMode(): boolean {
    return this.companyCoverageConfig && this.companyCoverageConfig.coverageConfig.manualMode;
  }

  get mapMinZoom(): number {
    if (!this.mediaQuery) {
      return defaultMapOptions.minZoom;
    }
    if (this.mediaQuery.sm && this.isDetailMode) {
      return 10;
    }
    if (this.mediaQuery.sm && !this.isDetailMode) {
      return 9;
    }
    if (this.mediaQuery.xs && this.isDetailMode) {
      return 9;
    }
    if (this.mediaQuery.xs && !this.isDetailMode) {
      return 8;
    }
    return defaultMapOptions.minZoom;
  }

  gMap: google.maps.Map;
  public fetching: boolean;
  public unsavedChanges: boolean;
  private readonly destroyed$ = new Subject<void>();
  private readonly repeat$ = new Subject<void>();

  constructor(private securityService: SecurityService,
              private boundariesService: BoundariesService,
              private companyService: CompanyService,
              private popUpService: PopUpMessageService,
              private gMapUtils: GoogleMapUtilsService,
              private popUpMessageService: PopUpMessageService,
              private basicMode: BasicModeService,
              private detailsMode: DetailModeService,
              private cdRef: ChangeDetectorRef,
              private tutorialService: TutorialsService,
              private coverageService: CoverageService,
              private mediaQueryService: MediaQueryService) {
  }

  ngOnInit(): void {
    this.fetching$ = this.coverageService.fetching$.asObservable().pipe(
      publishReplay(1),
      refCount()
    );
    this.unsavedChanges$ = this.coverageService.unsavedChanges$.asObservable().pipe(
      publishReplay(1),
      refCount()
    );
    this.mediaQueryService.screen
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
      ).subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
    });

    this.fetching$.subscribe(fetching => {
      this.fetching = fetching;
      this.cdRef.detectChanges();
    });
    this.unsavedChanges$.subscribe(unsavedChanges => {
      this.unsavedChanges = unsavedChanges;
      this.cdRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    const servedZipCodes$ = this.boundariesService.getAllServedZips();
    const coverageConfig$ = this.companyService.getCoverageConfig(this.securityService.getLoginModel().company);

    combineLatest([servedZipCodes$, coverageConfig$]).pipe(
      repeatWhen(() => this.repeat$),
      mergeMap(([servedZipCodes, companyCoverageConfig]) => {
        this.servedZipCodes = servedZipCodes;
        this.companyCoverageConfig = new CompanyCoverageConfig(companyCoverageConfig.coverageConfig, companyCoverageConfig.companyLocation);

        return this.gMap ? of(this.gMap) : this.agmMap.mapReady;
      }),
      takeUntil(this.destroyed$),
    ).subscribe((gMap: google.maps.Map) => {
        this.gMap = gMap;
        if (this.isDetailMode) {
          this.enableDetailMode();
        } else {
          this.enableBasicMode();
        }
      },
    );
  }

  onMapReady(gMap): void {
    this.gMap = gMap;
    this.coverageService.init(gMap);
    this.boundariesService.getUnsupportedArea()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((unsupportedArea: ZipBoundaries) =>
        this.gMapUtils.drawZipBoundaries(this.gMap, unsupportedArea),
      );
  }

  onModeChanged(isBasicMode: boolean): void {
    this.companyCoverageConfig.coverageConfig.manualMode = !isBasicMode;
    if (!isBasicMode) {
      this.basicMode.destroyMode();
      this.enableDetailMode();
    } else {
      this.detailsMode.destroyMode();
      this.enableBasicMode();
    }
  }

  onZipCodeFound(zipCodeProps: IZipCodeProps): void {
    if (this.companyCoverageConfig.coverageConfig.zips.includes(zipCodeProps.zipCode)
      || this.detailsMode.existInAddedHistory(zipCodeProps.zipCode)) {
      this.popUpService.showWarning(`${zipCodeProps.zipCode} already in your coverage`);
      return;
    }
    this.detailsMode.addZipCode(zipCodeProps);
  }

  onCompanyCirclePropsChanged(circleProps: ICircleProps): void {
    this.gMap.setCenter(circleProps.center);
    this.basicMode.getZipsByRadius(circleProps.center, circleProps.radius);
  }

  undo(zip: string): void {
    this.detailsMode.toggleZipCodeInHistory(zip, true);
  }

  saveChanges(): void {
    const coverageConfig = this.isDetailMode ? this.detailsMode.coverageConfig : this.basicMode.coverageConfig;
    if (!coverageConfig.zips.length) {
      this.popUpService.showError('At least one zip should be in your Service Area!');
      return;
    }
    this.updateCoverageConfig(coverageConfig);
    if (!this.isDetailMode) {
      this.basicMode.getZipsByRadius(new google.maps.LatLng(this.basicMode.coverageConfig.centerLat,
        this.basicMode.coverageConfig.centerLng),
        this.basicMode.coverageConfig.radius)
    }
  }

  ngOnDestroy(): void {
    this.basicMode.destroyMode();
    this.detailsMode.destroyMode();
    this.destroyed$.next();
    this.destroyed$.complete();
    this.repeat$.complete();
  }

  canDeactivate(): Observable<boolean> | boolean {
    return !this.unsavedChanges;
  }

  @HostListener('window:beforeunload', ['$event']) unloadNotification(event): any {
    if (!this.canDeactivate()) {

      return false;
    }
  }

  onShowCoverageTutorial(): void {
    this.tutorialService.showCoverageTutorial();
  }

  reset(): void {
    this.detailsMode.destroyMode();
    this.basicMode.destroyMode();
    this.coverageService.unsavedChanges$.next(false);
    this.repeat$.next();
  }

  private enableBasicMode(): void {
    this.basicMode.init(this.gMap, this.companyCoverageConfig, this.servedZipCodes);
  }

  private enableDetailMode(): void {
    this.detailsMode.init(this.gMap, this.companyCoverageConfig, this.servedZipCodes);
    this.detailsMode.infoWindowChange$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((zipInfoWindow: ZipInfoWindow) => {
      this.infoWindow = zipInfoWindow;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    });
    this.detailsMode.zipHistoryChange$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((zipHistory: ZipHistory) => {
      this.zipsHistory = zipHistory;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    });
  }

  private updateCoverageConfig(coverageConfig: CoverageConfig): void {
    this.isSavingChanges = true;
    this.companyService.updateCoverage(this.securityService.getLoginModel().company, coverageConfig)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isSavingChanges = false),
      )
      .subscribe((res) => {
        this.companyCoverageConfig.coverageConfig = coverageConfig;
        this.coverageService.unsavedChanges$.next(false);
        this.popUpService.showSuccess('Service area has been updated');
        if (this.isDetailMode) {
          this.detailsMode.clearZipHistory();
        }
      }, (err) => {
        this.isSavingChanges = false;
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }
}
