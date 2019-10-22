import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractorLeadsSearchComponent } from './contractor-leads-search.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { DataLayerManager, GoogleMapsAPIWrapper, InfoWindowManager, MarkerManager } from '@agm/core';

import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSidenavModule
} from '@angular/material';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { LeadsSearchMapComponent } from './leads-search-map.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { AgmSharedModule } from '../../../shared/agmShared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CvSpinnerModule } from '../../../theme/spinner/cv-spinner.module';
import { CvButtonModule } from '../../../theme/button/cv-button.module';
import { GoogleMapSidebarModule } from '../../../shared/google-map-sidebar/google-map-sidebar.module';

const contractorLeadsSearchRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: ContractorLeadsSearchComponent
  }]);

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatSidenavModule,
    MatProgressBarModule,
    contractorLeadsSearchRouting,
    FlexLayoutModule,
    FormsModule,
    AgmSnazzyInfoWindowModule,
    PipesModule,
    AgmSharedModule,
    PerfectScrollbarModule,
    CvSpinnerModule,
    CvButtonModule,
    GoogleMapSidebarModule
  ],
  declarations: [
    ContractorLeadsSearchComponent,
    LeadsSearchMapComponent
  ],
  providers: [
    BoundariesService,
    GoogleMapsAPIWrapper,
    DataLayerManager,
    MarkerManager,
    InfoWindowManager
  ]
})

export class ContractorLeadsSearchModule {
}




