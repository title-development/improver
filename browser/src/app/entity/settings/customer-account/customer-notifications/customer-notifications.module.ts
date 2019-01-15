import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { EqualValidator } from "../../../../validators/equal-validator.directive";

import {
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatInputModule,
  MatRadioModule
} from "@angular/material";

import { CustomerNotificationsComponent } from "./customer-notifications.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";

const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: CustomerNotificationsComponent },
]);

@NgModule({
  imports: [
    CommonModule,
    routing,
    MatCardModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [
    CustomerNotificationsComponent
  ],
  exports: [EqualValidator],
  providers: []
})
export class CustomerNotificationsModule {}



