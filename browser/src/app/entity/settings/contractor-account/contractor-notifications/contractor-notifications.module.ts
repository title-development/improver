import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { EqualValidator } from "../../../../validators/equal-validator.directive";

import {
  MatCardModule
} from "@angular/material";

import { ContractorNotificationsComponent } from "./contractor-notifications.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";

const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: ContractorNotificationsComponent },
]);

@NgModule({
  imports: [
    CommonModule,
    routing,
    MatCardModule,
    FormsModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [
    ContractorNotificationsComponent
  ],
  exports: [EqualValidator],
  providers: []
})
export class ContractorNotificationsModule {}



