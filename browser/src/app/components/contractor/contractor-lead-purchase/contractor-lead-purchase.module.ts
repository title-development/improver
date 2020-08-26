import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractorLeadPurchaseComponent } from './contractor-lead-purchase.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AccountService } from '../../../api/services/account.service';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { SharedModule } from '../../../shared/shared.module';
import { AgmSharedModule } from '../../../shared/agmShared.module';
import { LayoutModule } from '../../../layout/layout.module';
import { CvButtonModule } from '../../../theme/button/cv-button.module';
import { MapMarkersStore } from '../../../api/services/google-map-markers-store.service';


const contractorProfileRouting = RouterModule.forChild([
  {
    path: '',
    component: ContractorLeadPurchaseComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    contractorProfileRouting,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    CvButtonModule,
    FlexLayoutModule,
    LayoutModule,
    FormsModule,
    SharedModule,
    AgmSharedModule,
  ],
  declarations: [ContractorLeadPurchaseComponent],
  exports: [],
  providers: [AccountService, BoundariesService, MapMarkersStore]
})

export class ContractorLeadPurchaseModule {
}
