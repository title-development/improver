import {
  ApplicationRef,
  Component, ElementRef, HostListener, OnDestroy, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { MatDialog, MatSidenav } from '@angular/material';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { InfoWindowInt } from './intefaces/infoWindowInt';
import { PackMan } from './packman';
import { Lead, SystemMessageType } from '../../../model/data-model';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { LeadService } from '../../../api/services/lead.service';
import { MapMarkersStore } from '../../../util/google-map-markers-store.service';
import { defaultMapOptions, infoWindowDefaults } from '../../../util/google-map-default-options';
import { applyStyleToMapLayers } from '../../../util/google-map.utils';

@Component({
  selector: 'contractor-leads-search',
  templateUrl: './contractor-leads-search.component.html',
  styleUrls: ['./styles/contractor-leads-search.component.scss', './styles/leads-panel-list.scss', './styles/selected-lead-panel.scss']
})

export class ContractorLeadsSearchComponent implements OnDestroy {
  mapContentIsLoading: boolean = true;
  areas: Array<string> = [];
  mediaQuery: string = '';
  search: string = '';
  isSidebarOpen: boolean = true;
  sortedLeads: Array<Lead> = [];
  selectedLeadId: string = '';
  selectedLead: Lead = null;
  infoWindowData: InfoWindowInt = infoWindowDefaults;
  infoWindowOpenTrig: boolean = false;
  infoWindowContentAnim: boolean;
  mapOptions: MapOptions = defaultMapOptions;
  mapStyles = [
    {
      'featureType': 'road.highway',
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    }
  ];
  @ViewChild(MatSidenav) private mdSidebar: MatSidenav;
  @ViewChild('leadsPanel') private leadsPanelEl: ElementRef;
  private mediaWatcher: Subscription;
  private packMan: PackMan;
  private map;

  constructor(private query: ObservableMedia,
              private leadService: LeadService,
              private markersStore: MapMarkersStore,
              private dialog: MatDialog,
              private popUpMessageService: PopUpMessageService,
              private appRef: ApplicationRef) {
    this.mediaWatcher = this.query.subscribe((change: MediaChange) => {
      this.mediaQuery = change.mqAlias;
    });
  }

  moveMapToLead(lead: Lead): void {
    const selectedMarker = this.getMarkerFromStore(lead);
    if (selectedMarker) {
      this.map.setCenter(new google.maps.LatLng(selectedMarker.position.lat(), selectedMarker.position.lng()));
      this.map.panBy(this.getMapXOffset(), 0);
      google.maps.event.trigger(selectedMarker, 'mouseover');
    }
    // this.packMan.startAnimation(null, selectedMarker.position);

  }

  getMarkerFromStore(lead: Lead) {
    return this.markersStore.getMarkers().filter((marker) => {
      return marker.title.toString() == lead.location.zip.toString();
    })[0];
  }

  getLead(lead: Lead, index: number): void {
    if (!this.selectedLead || lead.id !== this.selectedLead.id) {
      // this.packMan.clearPackMan();
      this.mapContentIsLoading = true;
      this.selectedLeadId = lead.id;
      this.leadService
        .get(lead.id).subscribe(
        data => {
          this.selectedLead = data;
          this.mapContentIsLoading = false;
        },
        err => {
          //Show info message if lead no available to buy
          if (err.status == 409) {
            this.sortedLeads.splice(index, 1);
            this.sortedLeads = this.sortedLeads.slice();
            this.popUpMessageService.showMessage({
              text: 'This lead is not available anymore',
              type: SystemMessageType.WARN,
              timeout: 5000
            });
          }
          this.mapContentIsLoading = false;
        });
    }
  }

  onMapReady(map): void {
    this.map = map;
    // this.packMan = new PackMan(map);
  }

  /**
   * Sorting leads
   * @param {Array<Lead>} leads
   */
  onLeadsUpdate(leads: Array<Lead>): void {
    const inArea = [];
    const notInArea = [];
    leads.map((lead: Lead) => {
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
    this.mediaWatcher.unsubscribe();
  }

  /**
   * Calculating offset when sidebar and leadsPaned is opened
   * Return negative number
   * @returns {number}
   */
  private getMapXOffset(): number {
    const sidebarWidth = this.mdSidebar._width;
    const leadsPanelWidth = this.leadsPanelEl.nativeElement.offsetWidth;
    if (this.selectedLead && leadsPanelWidth) {
      return (leadsPanelWidth / 2) * -1;
    } else {
      return 0;
    }
  }
}
