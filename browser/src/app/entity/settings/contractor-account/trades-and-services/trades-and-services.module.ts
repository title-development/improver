import { ModuleWithProviders, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TradesAndServicesComponent } from "./trades-and-services.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";
import { CvCollapseModule } from "../../../../theme/collapse/cv-collapse.module";
import { CvSelectModule } from "../../../../theme/select/cv-select-module";
import { CvCheckboxModule } from "../../../../theme/checkbox/checkbox.module";
import { ComponentCanDeactivateGuard } from "../../../../auth/router-guards/component-can-deactivate.guard";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: TradesAndServicesComponent,
    canDeactivate: [ComponentCanDeactivateGuard]
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
