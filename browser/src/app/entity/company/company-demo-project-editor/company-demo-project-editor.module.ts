import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompanyDemoProjectEditorComponent } from "./company-demo-project-editor.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { CommonModule, DatePipe } from "@angular/common";

import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DemoProjectService } from "../../../api/services/demo-project.service";
import { CvInputFieldModule } from "../../../theme/input-field/form-field.module";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { CvButtonModule } from "../../../theme/button/cv-button.module";
import { CvIconModule } from "../../../theme/icon/cv-icon-module";
import { CvSelectModule } from "../../../theme/select/cv-select-module";
import { CvFieldsModule } from "../../../theme/fields/cv-fields.module";
import { SharedModule } from "../../../shared/shared.module";
import { CvDatePickerModule } from "../../../theme/date-picker/cv-date-picker.module";
import { ComponentCanDeactivateGuard } from '../../../auth/router-guards/component-can-deactivate.guard';

const routing = RouterModule.forChild([
  {
    path: '',
    component: CompanyDemoProjectEditorComponent,
    canDeactivate: [ComponentCanDeactivateGuard]
  }
]);

@NgModule({
  imports: [
    routing,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    CvButtonModule,
    CvIconModule,
    CvSelectModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
    CvDatePickerModule,
    FlexLayoutModule,
    SharedModule
  ],
  declarations: [
    CompanyDemoProjectEditorComponent
  ],
  providers: [DatePipe, DemoProjectService]
})

export class CompanyDemoProjectEditorModule {
}
