import { NgModule } from "@angular/core";
import { CvInputModule } from "../../input/cv-input.module";
import { CvInputFieldModule } from "../../input-field/form-field.module";
import { SharedDirectivesModule } from "../../../shared/shared-directives.module";
import { CvPasswordHintComponent } from "./cv-password-hint.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";


@NgModule({
  imports: [
    CvInputModule,
    CvInputFieldModule,
    FormsModule,
    MatIconModule,
    CommonModule,
    SharedDirectivesModule
  ],
  declarations: [
    CvPasswordHintComponent
  ],
  exports: [
    CvPasswordHintComponent
  ]
})
export class CvPasswordHintModule {
}
