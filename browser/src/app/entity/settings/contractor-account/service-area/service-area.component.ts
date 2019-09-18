import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { defaultMapOptions, mapStyle } from '../../../../util/google-map-default-options';
import { NgForm } from '@angular/forms';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { ZipBoundaries, ZipFeature } from '../../../../api/models/ZipBoundaries';
import { GoogleMapUtilsService } from '../../../../util/google-map.utils';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { SystemMessageType } from '../../../../model/data-model';
import { TricksService } from '../../../../util/tricks.service';
import { CoverageConfig } from '../../../../api/models/CoverageConfig';
import { AgmMap } from '@agm/core';
import { SecurityService } from '../../../../auth/security.service';
import { CompanyService } from '../../../../api/services/company.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';

import { ComponentCanDeactivate } from '../../../../auth/router-guards/pending-chanes.guard';
import { BasicModeService } from './services/basic-mode.service';
import { DetailModeService, ZipInfoWindow } from './services/detail-mode.service';
import { TutorialsService } from '../../../../api/services/tutorials.service';
import { CvSwitchComponent } from '../../../../theme/switch/switch.component';
import { CompanyCoverageConfig } from '../../../../api/models/CompanyCoverageConfig';
import { switchMap, takeUntil } from 'rxjs/internal/operators';
import { MediaQuery, MediaQueryService } from '../../../../util/media-query.service';
import { getErrorMessage } from '../../../../util/functions';
import { UserTutorial } from '../../../../api/models/UserTutorial';
import { UNSAVED_CHANGES_MESSAGE } from '../../../../util/messages';

@Component({
  selector: 'service-area',
  templateUrl: './service-area.component.html',
  styleUrls: ['./service-area.component.scss']
})
export class ServiceAreaComponent implements OnDestroy, ComponentCanDeactivate, OnInit {
  mapContentIsLoading: boolean = true;
  zipFormErrors: boolean;
  searchZip: string;
  configCoverage: CoverageConfig;
  UserTutorial = UserTutorial;
  miles: Array<number> = [10, 15, 20, 30, 40, 50];
  minZoom: number | 9 | 11 = 9;
  isHistoryShowed: boolean = true;
  zipsHistory: { added: Array<string>, removed: Array<string> } = {
    added: [],
    removed: []
  };
  center: google.maps.LatLng;
  toUpdate: Array<string> = [];
  @ViewChild(AgmMap) agmMap: AgmMap;
  mapOptions: MapOptions = defaultMapOptions;
  toggleInfo: boolean = false;
  mapStyles = mapStyle;
  unsaved: boolean = false;
  companyCenterZip: number;
  radius: number;
  infoWindow: ZipInfoWindow;
  COVERAGE_RADIUS_STEP = 5;
  MIN_COVERAGE_RADIUS = 5;
  MAX_COVERAGE_RADIUS = 50;
  media: MediaQuery;
  private servedZipCodes: Array<string>;
  private companyCoverageConfig: CompanyCoverageConfig;
  private map: google.maps.Map;
  private readonly destroyed$ = new Subject<void>();
  unsupportedArea: any;

  constructor(private securityService: SecurityService,
              private boundariesService: BoundariesService,
              private companyService: CompanyService,
              private gMapUtil: GoogleMapUtilsService,
              private popUpService: PopUpMessageService,
              private trickService: TricksService,
              private gMapUtils: GoogleMapUtilsService,
              private popUpMessageService: PopUpMessageService,
              private applicationRef: ApplicationRef,
              private basicMode: BasicModeService,
              private detailsMode: DetailModeService,
              private appRef: ApplicationRef,
              public tutorialService: TutorialsService,
              private mediaQuery: MediaQueryService,
              private cdRef: ChangeDetectorRef) {
    this.mediaQuery.screen.pipe(takeUntil(this.destroyed$)).subscribe((medias: MediaQuery) => {
      this.media = medias;
    });
  }

  ngOnInit(): void {
    let servedZipCodes$ = this.boundariesService.getAllServedZips();
    let configCoverage$ = this.companyService.getCoverageConfig(this.securityService.getLoginModel().company);

    forkJoin([servedZipCodes$, configCoverage$]).pipe(
      takeUntil(this.destroyed$),
      switchMap((results) => {
        let [servedZipCodes, companyCoverageConfig] = results;
        this.servedZipCodes = servedZipCodes;
        this.companyCoverageConfig = companyCoverageConfig;
        if (!this.configCoverage) {
          this.configCoverage = companyCoverageConfig.coverageConfig;
          this.radius = companyCoverageConfig.coverageConfig.radius;
        } else {
          this.configCoverage.zips = companyCoverageConfig.coverageConfig.zips;
        }
        return this.map ? of(this.map) : this.agmMap.mapReady;
      })
    ).subscribe((map: google.maps.Map) => {
        this.map = map;
        if (this.configCoverage.manualMode) {
          this.enableDetailMode();
        } else {
          this.enableBasicMode();
        }
      }
    );

  }

  onMapReady(map): void {
    this.map = map;
    this.boundariesService.getUnsupportedArea().subscribe(unsupportedArea => {
      this.unsupportedArea = unsupportedArea;
      this.gMapUtils.drawZipBoundaries(this.map, this.unsupportedArea);
    });

  }

  companyCenterZipChange(value: string): void {
    if (value && value.length >= 5) {
      this.mapContentIsLoading = true;
      if (this.gMapUtil.zipBoundariesStore.has(value.toString())) {
        this.mapContentIsLoading = false;
        const zipFeature: ZipFeature = this.gMapUtil.zipBoundariesStore.get(value.toString());
        const center = this.gMapUtil.getPolygonBounds(zipFeature.geometry.coordinates).getCenter();
        this.unsaved = true;
        this.map.setCenter(center);
        if (!this.configCoverage.manualMode) {
          if (center instanceof google.maps.LatLng) {
            this.center = center;
            this.configCoverage.centerLat = center.lat();
            this.configCoverage.centerLng = center.lng();
            this.basicMode.getZipsByRadius(this.center, this.configCoverage.radius);
          }
        }
      } else {
        this.boundariesService.getZipBoundaries([value.toString()]).subscribe(
          (zipBoundaries: ZipBoundaries) => {
            this.mapContentIsLoading = false;
            if (zipBoundaries.features.length > 0) {
              this.gMapUtil.zipBoundariesStore.set(value.toString(), zipBoundaries.features[0]);
              const center = this.gMapUtil.getPolygonBounds(zipBoundaries.features[0].geometry.coordinates).getCenter();
              this.map.setCenter(center);
              this.unsaved = true;
              this.gMapUtil.drawZipBoundaries(this.map, zipBoundaries);
              if (!this.configCoverage.manualMode) {
                if (center instanceof google.maps.LatLng) {
                  this.center = center;
                  this.configCoverage.centerLat = center.lat();
                  this.configCoverage.centerLng = center.lng();
                  this.basicMode.getZipsByRadius(this.center, this.configCoverage.radius);
                }
              }
            } else {
              this.popUpService.showMessage({
                text: 'Zip does not found',
                type: SystemMessageType.INFO,
                timeout: 3000
              });
            }
          },
          err => {
            console.log(err);
            this.mapContentIsLoading = false;
          });
      }
    }
  }

  validateZip(form: NgForm): void {
    this.zipFormErrors = !form.valid;
  }

  preventSwitch(cvSwitch: CvSwitchComponent, event: MouseEvent): void {
    if (this.unsaved) {
      if (!confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        this.radius = this.configCoverage.radius;
        this.companyCenterZip = undefined;
        this.unsaved = false;
        cvSwitch.toggle(event);
      }
    }
  }

  changeState(configCoverage: CoverageConfig): void {
    configCoverage.manualMode = !configCoverage.manualMode;
    if (configCoverage.manualMode) {
      this.enableDetailMode();
    } else {
      this.enableBasicMode();
    }
  }

  searchZipCode(form: NgForm): void {
    if (form.valid) {
      this.zipFormErrors = false;
      this.mapContentIsLoading = true;
      if (!this.servedZipCodes.includes(this.searchZip.toString())) {
        this.mapContentIsLoading = false;
        this.popUpService.showWarning(`${this.searchZip} doesn't supported`);
        return;
      }
      this.boundariesService.getZipBoundaries([this.searchZip]).subscribe(
        (zipBoundaries: ZipBoundaries) => {
          this.mapContentIsLoading = false;
          if (zipBoundaries.features.length > 0) {
            const center = this.gMapUtil.getPolygonBounds(zipBoundaries.features[0].geometry.coordinates).getCenter();
            this.map.setCenter(center);
            this.map.setZoom(13);
            if (this.configCoverage.zips.includes(this.searchZip) || this.zipsHistory.added.includes(this.searchZip)) {
              this.popUpService.showWarning(`${this.searchZip} already in your coverage`);
            } else {
              this.gMapUtil.drawZipBoundaries(this.map, zipBoundaries);
              this.detailsMode.addRemoveZip(this.searchZip);
              this.gMapUtil.highlightZip(this.map, this.searchZip, 3000, () => {
                this.detailsMode.selectMapZip(this.searchZip);
                form.resetForm();
                form.reset();
                this.zipFormErrors = false;
                Object.values(form.controls).forEach(control => control.markAsPristine());
                this.appRef.tick();
              });
            }
          } else {
            this.popUpService.showMessage({
              text: 'Zip does not found',
              type: SystemMessageType.INFO,
              timeout: 3000
            });
          }
        },
        err => {
          console.log(err);
          this.mapContentIsLoading = false;
        });
    }
  }


  radiusChange(event: Event): void {
    const center = this.center ? this.center : new google.maps.LatLng(this.configCoverage.centerLat, this.configCoverage.centerLng);
    this.basicMode.getZipsByRadius(center, this.radius);
  }

  undo(zip: string): void {
    this.detailsMode.addRemoveZip(zip, true);
  }

  save(): void {
    this.mapContentIsLoading = true;
    if (this.configCoverage.manualMode) {
      //deleting
      this.configCoverage.zips = this.configCoverage.zips.filter(zip => !this.zipsHistory.removed.some(removedZip => removedZip == zip));
      //adding
      this.configCoverage.zips = [...this.configCoverage.zips, ...this.zipsHistory.added];
    } else {
      this.configCoverage.zips = this.toUpdate.filter(zip => this.servedZipCodes.includes(zip));
    }
    this.configCoverage.radius = this.radius;
    if (this.configCoverage.zips.filter(zip => this.servedZipCodes.includes(zip)).length == 0) {
      this.popUpService.showError('At least one zip should be covered!');
      return;
    }
    this.gMapUtils.updateZipCoverageInStore(this.configCoverage.zips, this.map);
    this.companyService.updateCoverage(this.securityService.getLoginModel().company, this.configCoverage).subscribe(res => {
      this.unsaved = false;
      this.companyCenterZip = undefined;
      this.zipsHistory = {added: [], removed: []};
      this.detailsMode.zipsHistory = {added: [], removed: []};
      this.popUpService.showSuccess('Coverage area has been updated');
      this.mapContentIsLoading = false;
    }, err => {
      this.mapContentIsLoading = false;
      this.popUpMessageService.showError(getErrorMessage(err));
    });
  }

  ngOnDestroy(): void {
    this.basicMode.destroy();
    this.detailsMode.destroy();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  canDeactivate(): Observable<boolean> | boolean {
    return !this.unsaved;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {

      return false;
    }
  }

  zoomIn(): void {
    const zoom = this.map.getZoom();
    if(zoom >= this.mapOptions.maxZoom) {
      return
    }
    this.map.setZoom(zoom + 1);
  }

  zoomOut(): void {
    const zoom = this.map.getZoom();
    if(zoom <= this.minZoom) {
      return;
    }
    this.map.setZoom(zoom - 1);
  }

  showInfo() {
    this.toggleInfo = !this.toggleInfo;
  }

  completeTutorial(event: Event) {
    event.preventDefault();
    this.toggleInfo = false;
    this.tutorialService.complete(new UserTutorial(UserTutorial.Tutorial.COVERAGE));
  }

  private enableBasicMode(): void {
    this.minZoom = 10;
    this.detailsMode.destroy();
    this.basicMode.init(this.map, this.companyCoverageConfig, this.servedZipCodes);
    this.basicMode.fetching.pipe(takeUntil(this.destroyed$)).subscribe((res: boolean) => {
      this.mapContentIsLoading = res;
      this.cdRef.detectChanges();
    });
    this.basicMode.toUpdate.pipe(takeUntil(this.destroyed$)).subscribe((zips: Array<string>) => {
      this.toUpdate = zips;
      this.unsaved = this.toUpdate.length > 0;
    });
  }

  private enableDetailMode(): void {
    this.minZoom = 10;
    this.basicMode.destroy();
    this.detailsMode.init(this.map, this.companyCoverageConfig, this.servedZipCodes);
    this.detailsMode.fetching.pipe(takeUntil(this.destroyed$)).subscribe((res: boolean) => {
      this.mapContentIsLoading = res;
      this.cdRef.detectChanges();
    });
    this.detailsMode.onInfoWindow.pipe(takeUntil(this.destroyed$)).subscribe((zipInfoWindow: ZipInfoWindow) => {
      this.infoWindow = zipInfoWindow;
      this.appRef.tick();
    });
    this.detailsMode.zips.pipe(takeUntil(this.destroyed$)).subscribe((zips: { added: Array<string>, removed: Array<string> }) => {
      this.zipsHistory = zips;
      this.unsaved = !(this.zipsHistory.added.length == 0 && this.zipsHistory.removed.length == 0);
      this.appRef.tick();
    });
  }
}
