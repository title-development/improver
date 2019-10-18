import { ApplicationRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { InfoWindowInt } from './intefaces/infoWindowInt';

import { Lead, Pagination } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { LeadService } from '../../../api/services/lead.service';
import { MapMarkersStore } from '../../../util/google-map-markers-store.service';

import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google-map.utils';
import { ZipBoundaries, ZipFeature } from '../../../api/models/ZipBoundaries';
import { PopUpMessageService } from '../../../util/pop-up-message.service';

import { RestPage } from '../../../api/models/RestPage';
import { CompanyCoverageConfig } from '../../../api/models/CompanyCoverageConfig';
import { from, of, Subscription } from 'rxjs';
import { catchError, debounceTime, first, map, mergeMap, switchMap, tap } from 'rxjs/internal/operators';
import { Constants } from "../../../util/constants";


@Component({
  selector: 'leads-search-map',
  template: '',
  styles: []
})
export class LeadsSearchMapComponent implements OnDestroy {

  @Output() showInfoWindow: EventEmitter<InfoWindowInt> = new EventEmitter<InfoWindowInt>();
  @Output() updateLeads: EventEmitter<Array<Lead>> = new EventEmitter<Array<Lead>>();
  @Output() mapIsLoadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() areasChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  private map: any;
  private _areas: Array<string>;
  private _mapIsLoading: boolean;
  private leadSearchEffect$: Subscription;
  private companyLocation: { lat: number, lng: number };
  private pagination: Pagination;

  @Input()
  get mapIsLoading(): boolean {
    return this._mapIsLoading;
  }

  set mapIsLoading(value: boolean) {
    this._mapIsLoading = value;
    this.mapIsLoadingChange.emit(value);
  }

  @Input()
  get areas(): Array<string> {
    return this._areas;
  }

  set areas(value: Array<string>) {
    this.areasChange.emit(value);
    this._areas = value;
  }

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

    this.initMap();
  }

  initMap(): void {
    this.pagination = new Pagination(0, 100);
    this.leadService.getAll(null, this.pagination).pipe(first())
      .subscribe((leads: RestPage<Lead>) => {
        this.updateLeads.emit(leads.content);
      });
    this.leadSearchEffect$ = this.companyService.getCoverageConfig(this.securityService.getLoginModel().company).pipe(
      switchMap((companyCoverageConfig: CompanyCoverageConfig) => {
        this.areas = companyCoverageConfig.coverageConfig.zips;
        this.companyLocation = {
          lat: companyCoverageConfig.companyLocation.lat,
          lng: companyCoverageConfig.companyLocation.lng
        };

        return from(this.googleMapsAPIWrapper.getNativeMap());
      }),
      switchMap(map => {
        this.map = map;
        applyStyleToMapLayers(map, false);
        if (this.gMapUtils.zipBoundariesStore.size > 0) {
          this.gMapUtils.drawZipBoundaries(this.map, Array.from(this.gMapUtils.zipBoundariesStore.values()));
        }
        this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(this.companyLocation.lat, this.companyLocation.lng));
        this.map.setCenter(new google.maps.LatLng(this.companyLocation.lat, this.companyLocation.lng));

        return this.googleMapsAPIWrapper.subscribeToMapEvent('idle');
      }),
      debounceTime(200),
      switchMap(() => {
        this.mapIsLoading = true;
        const southWest: string = [this.map.getBounds().getSouthWest().lat(), this.map.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.map.getBounds().getNorthEast().lat(), this.map.getBounds().getNorthEast().lng()].join();

        //TODO: Andriy, this should be loading first
        return this.boundariesService.getSplitZipBoundaries(this.areas, this.constants.ZIPCODES_BATCH_SIZE).pipe(
            catchError((err) => {
              this.mapIsLoading = false;
              this.popUpMessageService.showError('Unexpected error during map rendering');
              return of(null);
            }));
      }),
      catchError(err => {
        this.mapIsLoading = false;

        return of(null);
      }),
      switchMap((zipBoundaries: ZipBoundaries | null) => {
        if (!zipBoundaries) {
          return of(null);
        }
        this.gMapUtils.drawZipBoundaries(this.map, this.gMapUtils.zipsToDraw(this.map, zipBoundaries, this.areas));

        //TODO: Andriy, this should be loading first
        const southWest: string = [this.map.getBounds().getSouthWest().lat(), this.map.getBounds().getSouthWest().lng()].join();
        const northEast: string = [this.map.getBounds().getNorthEast().lat(), this.map.getBounds().getNorthEast().lng()].join();
        return this.leadService.getAllInBoundingBox(null, this.pagination, southWest, northEast).pipe(catchError(err => {
            this.popUpMessageService.showError('Error requesting leads');
            this.mapIsLoading = false;

            return of(null);
          }
        ));
      }),
      catchError(err => {
        this.mapIsLoading = false;

        return of(null);
      }),
      mergeMap((leads: RestPage<Lead> | null) => {
          if (!leads) {
            this.mapIsLoading = false;
            return of(null);
          }
          this.updateLeads.emit(leads.content);
          this.mapIsLoading = false;
          const outsizeAreaZips: Map<string, Array<ZipFeature>> = this.gMapUtils.drawLeadsMarkers(this.map, leads.content, this.showInfoWindow);
          if (outsizeAreaZips.size > 0) {
            return this.boundariesService
              .getZipBoundaries(Array.from(outsizeAreaZips.keys())).pipe(
                map((zipBoundaries: ZipBoundaries) => {
                  return {zipBoundaries: zipBoundaries, outsizeAreaZips: outsizeAreaZips};
                })
              );

          } else {
            return of(null);
          }
        }
      ),
      tap((data: { zipBoundaries: ZipBoundaries, outsizeAreaZips: Map<string, Array<ZipFeature>> }) => {
        if (typeof data == 'object' && data) {
          this.gMapUtils.drawZipBoundaries(this.map, this.gMapUtils.zipsToDraw(this.map, data.zipBoundaries, this.areas));
          data.zipBoundaries.features.forEach((zipFeature: ZipFeature) => {
            const zipCenterLatLng = this.gMapUtils.getPolygonBounds(zipFeature.geometry.coordinates).getCenter();
            this.gMapUtils.createLeadMarker(this.map, zipFeature, zipCenterLatLng, data.outsizeAreaZips, this.showInfoWindow);
          });
        }
      })
    ).subscribe(
      res => {
      },
      err => {
        console.log(err);
        this.mapIsLoading = false;
      }
    );


  }

  ngOnDestroy(): void {
    this.leadSearchEffect$.unsubscribe();
  }
}
