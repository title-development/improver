import { ModuleWithProviders, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatRadioModule,
  MatSelectModule,
  MatSnackBarModule
} from "@angular/material";
import { TradesAndServicesComponent } from "./trades-and-services.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";
import { CvCollapseModule } from "../../../../theme/collapse/cv-collapse.module";
import { CvSelectModule } from "../../../../theme/select/cv-select-module";
import { CvCheckboxModule } from "../../../../theme/checkbox/checkbox.module";
import { PendingChangesGuard } from "../../../../auth/router-guards/pending-chanes.guard";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: TradesAndServicesComponent,
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
    MatDatepickerModule,
    MatSnackBarModule,
    MatNativeDateModule,
    FlexLayoutModule,
    FormsModule,
    MatAutocompleteModule,
    SharedModule,
    CvCollapseModule,
    CvSelectModule,
    CvCheckboxModule,
    LayoutModule
  ],
  declarations: [
    TradesAndServicesComponent
  ],
  exports: [
  ],
  providers: []
})

export class TradesAndServicesModule {}
