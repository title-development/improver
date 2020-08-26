import { DataLayerManager, GoogleMapsAPIWrapper } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { ComponentCanDeactivateGuard } from '../../../../auth/router-guards/component-can-deactivate.guard';
import { AgmSharedModule } from '../../../../shared/agmShared.module';
import { SharedModule } from '../../../../shared/shared.module';
import { MapMarkersStore } from '../../../../api/services/google-map-markers-store.service';
import { MapTechnicaService } from '../../../../api/services/maptechnica.service';
import { ServiceAreaComponent } from './service-area.component';
import { CoverageConfigurationModule } from './modules/coverage-configuration/coverage-configuration.module';
import { CoverageTutorialComponent } from './components/coverage-tutorial/coverage-tutorial.component';
import { GoogleMapSidebarModule } from '../../../../shared/google-map-sidebar/google-map-sidebar.module';

const routing = RouterModule.forChild([
  {
    path: '',
    component: ServiceAreaComponent,
    canDeactivate: [ComponentCanDeactivateGuard],
  },
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    FormsModule,
    SharedModule,
    AgmSharedModule,
    AgmSnazzyInfoWindowModule,
    GoogleMapSidebarModule,
    CoverageConfigurationModule,
  ],
  declarations: [
    ServiceAreaComponent,
    CoverageTutorialComponent,
  ],
  exports: [],
  providers: [
    BoundariesService,
    GoogleMapsAPIWrapper,
    DataLayerManager,
    MapTechnicaService,
    MapMarkersStore,
  ],

})

export class ServiceAreaModule {
}

