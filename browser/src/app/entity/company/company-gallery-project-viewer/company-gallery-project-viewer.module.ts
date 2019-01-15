import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GalleryProjectService } from "../../../api/services/gallery-project.service";
import { CvInputFieldModule } from "../../../theme/input-field/form-field.module";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { CvButtonModule } from "../../../theme/button/cv-button.module";
import { CvIconModule } from "../../../theme/icon/cv-icon-module";
import { CvSelectModule } from "../../../theme/select/cv-select-module";
import { CvFieldsModule } from "../../../theme/fields/cv-fields.module";
import { SharedModule } from "../../../shared/shared.module";
import { CompanyGalleryProjectViewerComponent } from "./company-gallery-project-viewer.component";
import { CompanyReviewsComponent } from "app/entity/company/company-profile/company-reviews/company-reviews.component";
import { NgArrayPipesModule } from "angular-pipes";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CompanyGalleryProjectViewerComponent
  }
]);

@NgModule({
  imports: [
    routing,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CvButtonModule,
    CvIconModule,
    CvSelectModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
    FlexLayoutModule,
    SharedModule,
    NgArrayPipesModule
  ],
  declarations: [
    CompanyGalleryProjectViewerComponent,
  ],
  providers: [DatePipe, GalleryProjectService]
})

export class CompanyGalleryProjectViewerModule {}
