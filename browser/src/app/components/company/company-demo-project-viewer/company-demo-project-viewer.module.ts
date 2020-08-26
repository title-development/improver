import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DemoProjectService } from "../../../api/services/demo-project.service";
import { CvInputFieldModule } from "../../../theme/input-field/form-field.module";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { CvButtonModule } from "../../../theme/button/cv-button.module";
import { CvIconModule } from "../../../theme/icon/cv-icon-module";
import { CvSelectModule } from "../../../theme/select/cv-select-module";
import { CvFieldsModule } from "../../../theme/fields/cv-fields.module";
import { SharedModule } from "../../../shared/shared.module";
import { CompanyDemoProjectViewerComponent } from "./company-demo-project-viewer.component";
import { NgArrayPipesModule, NgTailPipeModule } from "angular-pipes";

const routing = RouterModule.forChild([
  {
    path: '',
    component: CompanyDemoProjectViewerComponent
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
    NgArrayPipesModule,
    NgTailPipeModule
  ],
  declarations: [
    CompanyDemoProjectViewerComponent,
  ],
  providers: [DatePipe, DemoProjectService]
})

export class CompanyDemoProjectViewerModule {
}
