import { ModuleWithProviders, NgModule,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyInfoComponent } from "./company-info.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule} from "@angular/forms";
import {
  MatAutocompleteModule,
  MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule,
  MatIconModule, MatInputModule, MatNativeDateModule,
  MatRadioModule, MatSelectModule, MatSnackBarModule
} from "@angular/material";
import { SharedModule } from '../../../../shared/shared.module';
import { CvButtonModule } from "../../../../theme/button/cv-button.module";
import { CvInputFieldModule } from "../../../../theme/input-field/form-field.module";
import { CvInputModule } from "../../../../theme/input/cv-input.module";
import { CvIconModule } from "../../../../theme/icon/cv-icon-module";
import { CvSelectModule } from "../../../../theme/select/cv-select-module";
import { CvFieldsModule } from "../../../../theme/fields/cv-fields.module";
import { LayoutModule } from "../../../../layout/layout.module";
import { LocationValidateService } from '../../../../api/services/location-validate.service';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CompanyInfoComponent
  }
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    CvButtonModule,
    CvIconModule,
    CvSelectModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
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
    LayoutModule
  ],
  declarations: [
    CompanyInfoComponent
  ],
  exports: [
  ],
  providers: [
    LocationValidateService
  ]
})

export class CompanyInfoModule {}


