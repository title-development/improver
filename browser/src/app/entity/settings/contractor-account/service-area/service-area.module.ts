import { ModuleWithProviders, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CvButtonModule } from '../../../../theme/button/cv-button.module';
import { CvFieldsModule } from '../../../../theme/fields/cv-fields.module';
import { CvInputFieldModule } from '../../../../theme/input-field/form-field.module';
import { CvInputModule } from '../../../../theme/input/cv-input.module';
import { CvSpinnerModule } from '../../../../theme/spinner/cv-spinner.module';
import { MapMarkersStore } from '../../../../util/google-map-markers-store.service';
import { ServiceAreaComponent } from './service-area.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule,
  MatIconModule, MatInputModule,
  MatRadioModule, MatSelectModule,
} from '@angular/material';
import { DataLayerManager, GoogleMapsAPIWrapper } from '@agm/core';
import { MapTechnicaService } from '../../../../util/maptechnica.service';
import { BoundariesService } from '../../../../api/services/boundaries.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AgmSharedModule } from '../../../../shared/agmShared.module';
import { CvSwitchModule } from '../../../../theme/switch/switch.module';
import { CvSelectModule } from '../../../../theme/select/cv-select-module';
import { PendingChangesGuard } from '../../../../auth/router-guards/pending-chanes.guard';
import { BasicMode } from './BasicMode';
import { DetailMode } from './DetailMode';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TutorialService } from '../../../../api/services/tutorial.service';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: ServiceAreaComponent,
    canDeactivate: [PendingChangesGuard]
  }
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
    AgmSharedModule,
    AgmSnazzyInfoWindowModule,
    PerfectScrollbarModule,
    CvSpinnerModule,
    CvInputFieldModule,
    CvInputModule,
    CvButtonModule,
    CvFieldsModule,
    CvSwitchModule,
    CvSelectModule
  ],
  declarations: [
    ServiceAreaComponent
  ],
  exports: [],
  providers: [
    BoundariesService,
    GoogleMapsAPIWrapper,
    DataLayerManager,
    MapTechnicaService,
    MapMarkersStore,
    BasicMode,
    DetailMode,
    TutorialService
  ]

})

export class ServiceAreaModule {
}

