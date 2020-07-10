import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ContractorProjectViewComponent } from './contractor-project-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../util/constants';
import { SharedModule } from '../../../shared/shared.module';

const customerProjectViewRouting = RouterModule.forChild([
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




