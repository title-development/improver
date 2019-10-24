import { GoogleMapsAPIWrapper } from '@agm/core';
import { ApplicationRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { InfoWindowInt } from './intefaces/infoWindowInt';

import { BoundariesService } from '../../../api/services/boundaries.service';
import { CompanyService } from '../../../api/services/company.service';
import { LeadService } from '../../../api/services/lead.service';
import { SecurityService } from '../../../auth/security.service';
import { Lead, Pagination, ShortLead } from '../../../model/data-model';
import { MapMarkersStore } from '../../../util/google-map-markers-store.service';

import { ZipBoundaries, ZipFeature } from '../../../api/models/ZipBoundaries';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google-map.utils';
import { PopUpMessageService } from '../../../util/pop-up-message.service';

import { combineLatest, from, of, Subject, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  first,
  map,
  mergeMap,
  publishReplay,
  refCount,
  switchMap, takeUntil,
  tap,
} from 'rxjs/internal/operators';
import { CompanyCoverageConfig } from '../../../api/models/CompanyCoverageConfig';
import { RestPage } from '../../../api/models/RestPage';
import { Constants } from '../../../util/constants';

@Component({
  selector: 'imp-leads-search-map',
  template: '',
  styles: [],
})
export class LeadsSearchMapComponent implements OnInit, OnDestroy {

  @Output() showInfoWindow: EventEmitter<InfoWindowInt> = new EventEmitter<InfoWindowInt>();
  @Output() updateLeads: EventEmitter<ShortLead[]> = new EventEmitter<ShortLead[]>();
  @Output() mapIsLoadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() areasChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() companyCoverageConfig: EventEmitter<CompanyCoverageConfig> = new EventEmitter<CompanyCoverageConfig>();

  private gMap: any;
  private _areas: string[];
  private _mapIsLoading: boolean;
  private companyLocation: { lat: number, lng: number };
  private pagination =  new Pagination(0, 100);

  @Input()
  get mapIsLoading(): boolean {
    return this._mapIsLoading;
  }

  set mapIsLoading(value: boolean) {
    this._mapIsLoading = value;
    this.mapIsLoadingChange.emit(value);
  }

  @Input()
  get areas(): string[] {
    return this._areas;
  }

  set areas(value: string[]) {
    this.areasChange.emit(value);
    this._areas = value;
  }

  private readonly destroyed$ = new Subject<void>();

  constructor(private applicationRef: ApplicationRef,
              public securityService: SecurityService,
              private companyService: CompanyService,
              private boundariesService: BoundariesService,
              public leadService: LeadService,
              private googleMapsAPIWrapper: GoogleMapsAPIWrapper,
              private markersStore: MapMarkersStore,
              private popUpMessageService: PopUpMessageService,
              private constants: Constants,
              private gMapUtils: GoogleMapUtilsService) {

  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.leadService.getAll(null, this.pagination).pipe(
      takeUntil(this.destroyed$),
    ).subscribe((leads: RestPage<ShortLead>) => {
      this.updateLeads.emit(leads.content);
    });

    const companyCoverageConfig$ = this.companyService.getCoverageConfig(this.securityService.getLoginModel().company)
      .pipe(
        publishReplay(1),
        refCount(),
        tap((companyCoverageConfig: CompanyCoverageConfig) => {
          this.areas = companyCoverageConfig.coverageConfig.zips;
          this.companyCoverageConfig.emit(new CompanyCoverageConfig(companyCoverageConfig.coverageConfig, companyCoverageConfig.companyLocation));
          this.companyLocation = {
            lat: companyCoverageConfig.companyLocation.lat,
            lng: companyCoverageConfig.companyLocation.lng,
          };
        }),
      );

    const mapReady$ = from(this.googleMapsAPIWrapper.getNativeMap()).pipe(
      publishReplay(1),
      refCount(),
      tap((gMap) => {
        applyStyleToMapLayers(gMap, false, true);
        this.gMap = gMap;
      }),
    );

    this.showCompanyCoverage(mapReady$, companyCoverageConfig$);

    this.showLeadMarkers(mapReady$, companyCoverageConfig$);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private showLeadMarkers(mapReady$, companyCoverageConfig$) {
    combineLatest([mapReady$, companyCoverageConfig$]).pipe(
      mergeMap(() => {
        const center = new google.maps.LatLng(this.companyLocation.lat, this.companyLocation.lng);
        this.gMapUtils.drawCompanyMarker(this.gMap, center);
        this.gMap.setCenter(center);

        return this.googleMapsAPIWrapper.subscribeToMapEvent('idle');
      }),
      debounceTime(200),
      mergeMap(() => {
        this.mapIsLoading = true;
        const southWest: string = [this.gMap.getBounds().getSouthWest().lat(), this.gMap.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.gMap.getBounds().getNorthEast().lat(), this.gMap.getBounds().getNorthEast().lng()].join();

        return this.leadService.getAllInBoundingBox(null, this.pagination, southWest, northEast).pipe(
          catchError((err) => {
              this.popUpMessageService.showError('Error requesting leads');
              this.mapIsLoading = false;

              return of(null);
            },
          ));
      }),
      tap((leads: RestPage<ShortLead> | null) => {
          if (!leads || !leads.content.length) {
            this.mapIsLoading = false;
            return of(null);
          }
          this.mapIsLoading = false;
          this.updateLeads.emit(leads.content);
          const groupLeadsByZipCode = this.groupLeadsByZipCode(leads.content);
          this.drawLeadMarkers(groupLeadsByZipCode);
        },
      ),
      takeUntil(this.destroyed$),
    ).subscribe(
      (res) => {
      },
      (err) => {
        console.log(err);
        this.mapIsLoading = false;
      },
    );
  }

  private showCompanyCoverage(mapReady$, companyCoverageConfig$) {
    combineLatest([mapReady$, companyCoverageConfig$]).pipe(
      mergeMap(() => {
        this.mapIsLoading = true;

        return this.boundariesService.getSplitZipBoundaries(this.areas, this.constants.ZIPCODES_BATCH_SIZE).pipe(
          catchError((err) => {
            this.mapIsLoading = false;
            this.popUpMessageService.showError('Unexpected error during gMap rendering');
            return of(null);
          }));
      }),
      takeUntil(this.destroyed$),
    ).subscribe((zipBoundaries: ZipBoundaries | null) => {
      this.gMapUtils.drawZipBoundaries(this.gMap, this.gMapUtils.zipsToDraw(this.gMap, zipBoundaries, this.areas));
    });
  }

  private drawLeadMarkers(groupLeadsByZipCode: Map<string, ShortLead[]>) {
    this.gMapUtils.clearLeadsMarkers();
    Array.from(groupLeadsByZipCode.entries())
      .forEach(([zipCode, leads]: [string, ShortLead[]]) => {
        const centroid = leads[0].centroid;
        const inCoverage = this.areas.includes(zipCode);
        this.gMapUtils.createLeadMarker(this.gMap, zipCode, centroid, leads, inCoverage, this.showInfoWindow);
      });
  }

  private groupLeadsByZipCode(leads: ShortLead[]): Map<string, ShortLead[]> {
    const grouped = new Map<string, ShortLead[]>();
    leads.forEach((lead) => {
      const zipCode = lead.location.zip.toString();
      if (!grouped.has(zipCode)) {
        grouped.set(zipCode, [lead]);
      } else {
        grouped.set(zipCode, [...grouped.get(zipCode), lead]);
      }
    });

    return grouped;
  }
}
