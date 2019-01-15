import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompanyGalleryProjectEditorComponent } from "./company-gallery-project-editor.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { CommonModule, DatePipe } from "@angular/common";

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule, MatDatepickerModule, MatIconModule, MatInputModule, MatNativeDateModule, MatRadioModule,
  MatSelectModule
} from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GalleryProjectService } from "../../../api/services/gallery-project.service";
import { CvInputFieldModule } from "../../../theme/input-field/form-field.module";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { CvButtonModule } from "../../../theme/button/cv-button.module";
import { CvIconModule } from "../../../theme/icon/cv-icon-module";
import { CvSelectModule } from "../../../theme/select/cv-select-module";
import { CvFieldsModule } from "../../../theme/fields/cv-fields.module";
import { SharedModule } from "../../../shared/shared.module";
import { CvDatePickerModule } from "../../../theme/date-picker/cv-date-picker.module";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CompanyGalleryProjectEditorComponent
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
    CompanyGalleryProjectEditorComponent
  ],
  providers: [DatePipe, GalleryProjectService]
})

export class CompanyGalleryProjectEditorModule {}
