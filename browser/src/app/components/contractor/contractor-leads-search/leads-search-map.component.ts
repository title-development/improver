import { GoogleMapsAPIWrapper } from '@agm/core';
import {
  ApplicationRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { InfoWindowInt } from './intefaces/infoWindowInt';

import { BoundariesService } from '../../../api/services/boundaries.service';
import { CompanyService } from '../../../api/services/company.service';
import { LeadService } from '../../../api/services/lead.service';
import { SecurityService } from '../../../auth/security.service';
import { Pagination, ShortLead } from '../../../model/data-model';
import { MapMarkersStore } from '../../../api/services/google-map-markers-store.service';

import { ZipBoundaries } from '../../../api/models/ZipBoundaries';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google/google-map.utils';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';

import { combineLatest, from, of, Subject } from 'rxjs';
import { catchError, debounceTime, mergeMap, publishReplay, refCount, takeUntil, tap, } from 'rxjs/internal/operators';
import { CompanyCoverageConfig } from '../../../api/models/CompanyCoverageConfig';
import { RestPage } from '../../../api/models/RestPage';
import { Constants } from '../../../util/constants';
import { FilterByPipe } from "../../../pipes/filter.pipe";

@Component({
  selector: 'imp-leads-search-map',
  template: '',
  styles: [],
})
export class LeadsSearchMapComponent implements OnInit, OnDestroy, OnChanges {

  @Input() searchTerm: string;
  @Input() inCoverageOnly: boolean;
  @Output() showInfoWindow: EventEmitter<InfoWindowInt> = new EventEmitter<InfoWindowInt>();
  @Output() updateLeads: EventEmitter<ShortLead[]> = new EventEmitter<ShortLead[]>(true);
  @Output() mapIsLoadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() areasChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() companyCoverageConfig: EventEmitter<CompanyCoverageConfig> = new EventEmitter<CompanyCoverageConfig>();

  private gMap: any;
  private _areas: string[];
  private _mapIsLoading: boolean;
  private companyLocation: { lat: number, lng: number };
  private pagination =  new Pagination(0, 100);
  private leads = [];

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
              private gMapUtils: GoogleMapUtilsService,
              private filterByPipe: FilterByPipe) {

  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.leadService.getAllInCoverage(null, this.pagination).pipe(
      takeUntil(this.destroyed$),
    ).subscribe((leads: RestPage<ShortLead>) => {
      this.leads = leads.content;
      this.updateLeads.emit(this.filterLeads(leads.content));
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

        return this.leadService.getAllInBoundingBox(null, false, southWest, northEast, this.pagination).pipe(
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
          this.groupAndDrawLeads(leads.content)
        },
      ),
      takeUntil(this.destroyed$),
    ).subscribe(
      (res) => {
      },
      err => {
        console.error(err);
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

  groupAndDrawLeads(leads) {
    this.leads = leads;
    leads = this.filterLeads(leads);
    this.updateLeads.emit(leads);
    const groupLeadsByZipCode = this.groupLeadsByZipCode(leads);
    this.drawLeadMarkers(groupLeadsByZipCode);
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

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.searchTerm && !changes.searchTerm.firstChange || changes.inCoverageOnly && !changes.inCoverageOnly.firstChange) && this.gMap) {
      this.groupAndDrawLeads(this.leads);
    }
  }

  filterLeads(leads) {
    const inArea = [];
    const notInArea = [];

    leads.map((lead: ShortLead) => {
      if (this.areas.includes(lead.location.zip.toString())) {
        inArea.push(lead);
        lead.inCoverage = true;
      } else {
        notInArea.push(lead);
      }
    });
    leads = this.inCoverageOnly ? inArea : inArea.concat(notInArea);
    leads = this.searchTerm ? this.filterByPipe.transform(leads, {serviceType: this.searchTerm}) : leads
    return leads
  }

}
