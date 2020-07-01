import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractorLeadsSearchComponent } from './contractor-leads-search.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { DataLayerManager, GoogleMapsAPIWrapper, InfoWindowManager, MarkerManager } from '@agm/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { LeadsSearchMapComponent } from './leads-search-map.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { AgmSharedModule } from '../../../shared/agmShared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CvSpinnerModule } from '../../../theme/spinner/cv-spinner.module';
import { CvButtonModule } from '../../../theme/button/cv-button.module';
import { GoogleMapSidebarModule } from '../../../shared/google-map-sidebar/google-map-sidebar.module';
import { CvCheckboxModule } from "../../../theme/checkbox/checkbox.module";
import { FilterByPipe } from "../../../pipes/filter.pipe";

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
    CvCheckboxModule,
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
    InfoWindowManager,
    FilterByPipe
  ]
})

export class ContractorLeadsSearchModule {
}




