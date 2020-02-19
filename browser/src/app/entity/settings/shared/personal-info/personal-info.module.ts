import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { EqualValidator } from "../../../../validators/equal-validator.directive";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { PersonalInfoComponent } from "./personal-info.component";
import { SharedModule } from '../../../../shared/shared.module';
import { CvButtonModule } from '../../../../theme/button/cv-button.module';
import { LayoutModule } from "../../../../layout/layout.module";
import { CvFieldsModule } from "../../../../theme/fields/cv-fields.module";
import { CvInputModule } from "../../../../theme/input/cv-input.module";
import { CvInputFieldModule } from "../../../../theme/input-field/form-field.module";
import { CvEditableInputModule } from '../../../../theme/editable-input/editable-input.module';
import { CvIconModule } from '../../../../theme/icon/cv-icon-module';

const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: PersonalInfoComponent },
]);

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    routing,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
    LayoutModule,
    CvButtonModule,
    CvInputModule,
    CvIconModule,
    CvInputFieldModule,
    CvFieldsModule,
    CvEditableInputModule,
  ],
  declarations: [
    PersonalInfoComponent
  ],
  exports: [EqualValidator],
  providers: []
})
export class PersonalInfoModule {}



