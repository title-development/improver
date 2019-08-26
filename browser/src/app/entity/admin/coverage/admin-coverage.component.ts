import { ApplicationRef, Component, ContentChild, ViewChild } from '@angular/core';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { defaultMapOptions } from '../../../util/google-map-default-options';
import { ZipInfoWindow } from '../../settings/contractor-account/service-area/services/detail-mode.service';
import { AdminMap } from './admin-map';
import { NgForm } from '@angular/forms';
import { ZipBoundaries, ZipFeature } from '../../../api/models/ZipBoundaries';
import { SystemMessageType } from '../../../model/data-model';
import { GoogleMapUtilsService } from '../../../util/google-map.utils';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { getErrorMessage } from '../../../util/functions';

@Component({
  selector: 'admin-coverage',
  templateUrl: './admin-coverage.component.html',
  styleUrls: ['./admin-coverage.component.scss']
})
export class AdminCoverageComponent {

  fetching: boolean = true;
  infoWindow: ZipInfoWindow;
  hasChanges: boolean = false;
  zipsHistory: { added: Array<string>, removed: Array<string> } = {
    added: [],
    removed: []
  };
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
  searchZip: string;
  zipFormErrors: boolean;
  private map;
  private coveredArea;

  @ViewChild('adminMap') adminMap: AdminMap;

  constructor(private  appRef: ApplicationRef,
              private gMapUtil: GoogleMapUtilsService,
              private popUpService: PopUpMessageService,
              private boundariesService: BoundariesService) {
    this.boundariesService.getAllServedZips().subscribe((zips: Array<string>) => {
      this.coveredArea = zips;
      this.adminMap.init(zips);
    });
  }

  updateInfoWindowState(infoWindow) {
    this.infoWindow = infoWindow;
    this.appRef.tick();
  }

  updateZips(zips) {
    this.zipsHistory = zips;
    this.appRef.tick();
  }

  onMapReady(map): void {
    this.map = map;
  }

  undo(zip: string): void {
    this.adminMap.addRemoveZip(zip, true);
  }

  updateCoverage() {
    //deleting
    this.coveredArea = this.coveredArea.filter(zip => !this.zipsHistory.removed.some(removedZip => removedZip == zip));
    //adding
    this.coveredArea = [...this.coveredArea, ...this.zipsHistory.added];
    if (this.coveredArea.length == 0) {
      this.popUpService.showError('At least one zip should be selected!');
      return;
    }
    this.gMapUtil.updateCoverageInStore(this.coveredArea, this.map);
    this.boundariesService.updateServedZips(this.coveredArea).subscribe(res => {
      this.popUpService.showSuccess('Coverage area has been updated');
      this.refresh();
    }, err => {
      this.popUpService.showError(getErrorMessage(err));
    });
  }

  validateZip(form: NgForm): void {
    this.zipFormErrors = !form.valid;
  }

  searchZipCode(form: NgForm): void {
    if (form.valid) {
      this.zipFormErrors = false;
      this.fetching = true;
      if (!this.coveredArea.includes(this.searchZip.toString())) {
        this.fetching = false;
        this.popUpService.showWarning(`${this.searchZip} doesn't supported`);
        return;
      }
      this.boundariesService.getZipBoundaries([this.searchZip]).subscribe(
        (zipBoundaries: ZipBoundaries) => {
          this.fetching = false;
          if (zipBoundaries.features.length > 0) {
            const center = this.gMapUtil.getPolygonBounds(zipBoundaries.features[0].geometry.coordinates).getCenter();
            this.map.setCenter(center);
            this.map.setZoom(13);
            if (this.coveredArea.includes(this.searchZip) || this.zipsHistory.added.includes(this.searchZip)) {
              this.popUpService.showWarning(`${this.searchZip} already in your coverage`);
              this.gMapUtil.highlightZip(this.map, this.searchZip, 3000);
            } else {
              this.gMapUtil.drawBoundaries(this.map, zipBoundaries);
              this.adminMap.addRemoveZip(this.searchZip);
              this.gMapUtil.highlightZip(this.map, this.searchZip, 3000, () => {
                this.adminMap.selectMapZip(this.searchZip);
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
          this.fetching = false;
        });
    }
  }

  refresh(): void {
    this.adminMap.refresh();
    this.boundariesService.getAllServedZips().subscribe((zips: Array<string>) => {
      this.coveredArea = zips;
      this.adminMap.coveredArea = zips;
    });
  }
}
