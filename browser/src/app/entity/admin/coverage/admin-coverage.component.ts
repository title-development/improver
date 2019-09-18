import { ApplicationRef, Component, ViewChild } from '@angular/core';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { defaultMapOptions } from '../../../util/google-map-default-options';
import { ZipInfoWindow } from '../../settings/contractor-account/service-area/services/detail-mode.service';
import { AdminMap } from './admin-map';
import { GoogleMapUtilsService } from '../../../util/google-map.utils';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { getErrorMessage } from '../../../util/functions';
import { CountyMapArea } from "../../../api/models/CountyBoundaries";
import { finalize } from "rxjs/operators";

@Component({
  selector: 'admin-coverage',
  templateUrl: './admin-coverage.component.html',
  styleUrls: ['./admin-coverage.component.scss']
})
export class AdminCoverageComponent {

  MAP_MIN_ZOOM = 8;
  loading: boolean = true;
  infoWindow: ZipInfoWindow;
  hasChanges: boolean = false;
  areasHistory: { added: Array<CountyMapArea>, removed: Array<CountyMapArea> } = {
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

  private map;
  private coveredArea;

  @ViewChild('adminMap') adminMap: AdminMap;

  constructor(private  appRef: ApplicationRef,
              private gMapUtil: GoogleMapUtilsService,
              private popUpService: PopUpMessageService,
              private boundariesService: BoundariesService) {
    this.boundariesService.getAllServedCounties().subscribe(areas => {
      this.coveredArea = areas;
      this.adminMap.init(areas);
    });
  }

  updateInfoWindowState(infoWindow) {
    this.infoWindow = infoWindow;
    this.appRef.tick();
  }

  updateAreas(areas) {
    this.areasHistory = areas;
    this.appRef.tick();
  }

  onMapReady(map): void {
    this.map = map;
  }

  undo(county: CountyMapArea): void {
    this.adminMap.addRemovedArea(county, true);
  }

  updateCoverage() {
    this.loading = true;
    this.boundariesService.updateServedCounties(this.areasHistory.added.map(a => a.id), this.areasHistory.removed.map(a => a.id))
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
      //  removing
      this.coveredArea = this.coveredArea.filter(area => !this.areasHistory.removed.some(removedArea => removedArea.id == area));
      //  adding
      this.coveredArea = [...this.coveredArea, ...this.areasHistory.added.map(a => a.id)];
      this.gMapUtil.updateCountyCoverageInStore(this.coveredArea, this.map);
      this.popUpService.showSuccess('Coverage area has been updated');
      this.refresh();
    }, err => {
      this.popUpService.showError(getErrorMessage(err));
    });
  }

  refresh(): void {
    this.adminMap.refresh();
    this.boundariesService.getAllServedCounties().subscribe(areas => {
      this.coveredArea = areas;
      this.adminMap.coveredArea = areas;
    });
  }
}
