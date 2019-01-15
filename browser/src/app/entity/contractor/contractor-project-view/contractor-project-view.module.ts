import { ModuleWithProviders, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatListModule,
  MatTabsModule
} from '@angular/material';
import { ContractorProjectViewComponent } from './contractor-project-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../util/constants';
import { SharedModule } from '../../../shared/shared.module';

const customerProjectViewRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: ContractorProjectViewComponent
  }
]);

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatInputModule,
    customerProjectViewRouting,
    MatCardModule,
    FlexLayoutModule
  ],
  declarations: [
    ContractorProjectViewComponent
  ],
  providers: [Constants]
})
export class ContractorProjectViewModule {
}




