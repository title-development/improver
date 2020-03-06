import { MapOptions } from '@agm/core/services/google-maps-types';
import { ApplicationRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ZipBoundaries } from "../../../api/models/ZipBoundaries";
import { BoundariesService } from "../../../api/services/boundaries.service";
import { LeadService } from '../../../api/services/lead.service';
import { Lead, ShortLead, SystemMessageType } from '../../../model/data-model';
import { getErrorMessage } from '../../../util/functions';
import { defaultMapOptions, infoWindowDefaults, mapStyle } from '../../../util/google-map-default-options';
import { MapMarkersStore } from '../../../util/google-map-markers-store.service';
import { GoogleMapUtilsService } from "../../../util/google-map.utils";
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { InfoWindowInt } from './intefaces/infoWindowInt';
import { CompanyCoverageConfig } from '../../../api/models/CompanyCoverageConfig';

@Component({
  selector: 'contractor-leads-search',
  templateUrl: './contractor-leads-search.component.html',
  styleUrls: ['./styles/contractor-leads-search.component.scss', './styles/leads-panel-list.scss', './styles/selected-lead-panel.scss'],
})

export class ContractorLeadsSearchComponent implements OnDestroy {
  mapContentIsLoading: boolean = true;
  areas: string[] = [];
  search: string = '';
  isSidebarOpen: boolean = true;
  sortedLeads: Lead[] = [];
  selectedLeadId: string = '';
  selectedLead: Lead = null;
  infoWindowData: InfoWindowInt = infoWindowDefaults;
  infoWindowOpenTrig: boolean = false;
  infoWindowContentAnim: boolean;
  mapOptions: MapOptions = defaultMapOptions;
  mapStyles = mapStyle;
  mediaQuery: MediaQuery;
  companyCoverageConfig: CompanyCoverageConfig;
  @ViewChild(MatSidenav, {static: true}) private mdSidebar: MatSidenav;
  @ViewChild('leadsPanel') private leadsPanelEl: ElementRef;
  gMap;

  private readonly destroyed$ = new Subject<void>();

  constructor(private mediaQueryService: MediaQueryService,
              private leadService: LeadService,
              private markersStore: MapMarkersStore,
              private dialog: MatDialog,
              private popUpMessageService: PopUpMessageService,
              private appRef: ApplicationRef,
              private router: Router,
              private boundariesService: BoundariesService,
              private gMapUtils: GoogleMapUtilsService,
              private activatedRoute: ActivatedRoute) {

    this.mapOptions.minZoom = 8;
    this.mapOptions.zoom = 10;

    router.events
      .pipe(takeUntil(this.destroyed$))
      .subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (!this.mdSidebar.opened) {
          this.mdSidebar.open();
        }
      }
    });

    this.mediaQueryService.screen
      .pipe(
        takeUntil(this.destroyed$),
      ).subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
    });
  }


  get defaultZoom(): number {
    if (!this.mediaQuery) {
      return defaultMapOptions.minZoom;
    }
    if (this.mediaQuery.xs) {
      return 8;
    }
    if (this.mediaQuery.sm || this.mediaQuery.md) {
      return 9;
    }
    if (this.mediaQuery.lg || this.mediaQuery.xlg) {
      return 10;
    }
    return 10;
  }

  moveMapToLead(lead: Lead): void {
    const selectedMarker = this.getMarkerFromStore(lead);
    if (selectedMarker) {
      const isMobile = this.mediaQuery.xs || this.mediaQuery.sm;
      if (isMobile) {
        this.mdSidebar.close();
      }
      this.gMap.setCenter(new google.maps.LatLng(selectedMarker.position.lat(), selectedMarker.position.lng()));
      this.gMap.panBy(this.getMapXOffset(isMobile), 0);
      google.maps.event.trigger(selectedMarker, 'mouseover');
    }
  }

  getMarkerFromStore(lead: Lead) {
    return this.markersStore.getMarkers().filter((marker) => {
      return marker.title.toString() == lead.location.zip.toString();
    })[0];
  }

  getLead(lead: Lead, index: number): void {
    if (!this.selectedLead || lead.id !== this.selectedLead.id) {
      this.mapContentIsLoading = true;
      this.selectedLeadId = lead.id;
      this.leadService
        .get(lead.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
        (data) => {
          this.selectedLead = data;
          this.mapContentIsLoading = false;
          this.mdSidebar.open();
        },
        (err) => {
          // Show info message if lead no available to buy
          if (err.status == 404) {
            this.sortedLeads.splice(index, 1);
            this.sortedLeads = this.sortedLeads.slice();
            this.popUpMessageService.showMessage({
              text: 'This lead is not available anymore',
              type: SystemMessageType.WARN,
              timeout: 5000,
            });
          } else {
            this.popUpMessageService.showError(getErrorMessage(err));
          }
          this.mapContentIsLoading = false;
        });
    }
  }

  onMapReady(gMap): void {
    this.gMap = gMap;
    this.boundariesService.getUnsupportedArea()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((unsupportedArea: ZipBoundaries) =>
        this.gMapUtils.drawZipBoundaries(this.gMap, unsupportedArea),
      );
  }

  /**
   * Sorting leads
   * @param {Array<Lead>} leads
   */
  onLeadsUpdate(leads: ShortLead[]): void {
    const inArea = [];
    const notInArea = [];
    leads.map((lead: ShortLead) => {
      if (this.areas.includes(lead.location.zip.toString())) {
        inArea.push(lead);
      } else {
        notInArea.push(lead);
      }
    });
    this.sortedLeads = inArea.concat(notInArea);
  }

  onShowInfoWindow(infoWindowData: InfoWindowInt): void {
    this.infoWindowData = infoWindowData;
    if (!this.infoWindowOpenTrig) {
      this.infoWindowOpenTrig = true;
      setTimeout(() => {
        this.infoWindowContentAnim = true;
      }, 100);
    }
    this.appRef.tick();
  }

  @HostListener('window:keyup', ['$event'])
  onEscClicked(e: KeyboardEvent): void {
    if (e.keyCode == 27) {
      if (this.infoWindowOpenTrig) {
        this.onCloseInfoWindow();
      }
      if (this.selectedLead) {
        this.selectedLead = null;
      }
    }
  }

  onCloseInfoWindow(): void {
    if (this.infoWindowOpenTrig) {
      this.infoWindowContentAnim = false;
      this.infoWindowOpenTrig = false;
    }
    this.appRef.tick();
  }

  onShowLeadData(e: Event, lead: Lead, index: number): void {
    e.preventDefault();
    this.getLead(lead, index);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onCompanyCoverageConfig(coverageConfig: CompanyCoverageConfig): void {
    this.companyCoverageConfig = coverageConfig;
  }

  /**
   * Calculating offset when sidebar and leadsPaned is opened
   * Return negative number
   * @returns {number}
   */
  private getMapXOffset(sideViewClosed: boolean = false): number {
    const leadsPanelWidth = this.leadsPanelEl.nativeElement.offsetWidth;

    if (sideViewClosed) {
      return 0;
    }

    if (this.selectedLead && leadsPanelWidth) {
      return (leadsPanelWidth / 2) * -1;
    } else {
      return 0;
    }
  }
}
