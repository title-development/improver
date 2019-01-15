import { NgModule } from "@angular/core";
import { CvCheckbox } from "./cv-checkbox/cv-checkbox";
import { CvCheckboxGroup } from "./cv-checkbox.group/cv-checkbox-group";
import { CvFieldsModule } from '../fields/cv-fields.module';
import { CommonModule } from "@angular/common";
import { CvTemplate } from "../common/cv-template.directive";

@NgModule({
  imports: [CvFieldsModule, CommonModule],
  declarations: [CvCheckbox, CvCheckboxGroup, CvTemplate],
  entryComponents: [CvCheckbox, CvCheckboxGroup],
  exports: [CvCheckbox, CvCheckboxGroup, CvTemplate]
})
export class CvCheckboxModule {

}
