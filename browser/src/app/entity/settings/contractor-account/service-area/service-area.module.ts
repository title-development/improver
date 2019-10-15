import { DataLayerManager, GoogleMapsAPIWrapper } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { PendingChangesGuard } from '../../../../auth/router-guards/pending-chanes.guard';
import { AgmSharedModule } from '../../../../shared/agmShared.module';
import { SharedModule } from '../../../../shared/shared.module';
import { MapMarkersStore } from '../../../../util/google-map-markers-store.service';
import { MapTechnicaService } from '../../../../util/maptechnica.service';
import { CoverageSidebarModule } from './modules/coverage-sidebar/coverage-sidebar.module';
import { ServiceAreaComponent } from './service-area.component';
import { CoverageConfigurationModule } from './modules/coverage-configuration/coverage-configuration.module';
import { CoverageTutorialComponent } from './components/coverage-tutorial/coverage-tutorial.component';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: ServiceAreaComponent,
    canDeactivate: [PendingChangesGuard],
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
    CoverageSidebarModule,
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

