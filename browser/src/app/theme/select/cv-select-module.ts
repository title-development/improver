import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvIconModule } from '../icon/cv-icon-module';
import { CvInputFieldModule } from '../input-field/form-field.module';
import { CvInputModule } from '../input/cv-input.module';
import { FilterByPipe } from '../util/filter.pipe';
import { CvSelectComponent } from './cv-select/cv-select';
import { OverlayRef } from '../util/overlayRef';
import { CvCheckboxModule } from '../checkbox/checkbox.module';
import { FormsModule } from '@angular/forms';
import { CvOverlayDirective } from '../util/cv-overlay.directive';
import { CvHolder } from '../util/cv-holder';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { SharedDirectivesModule } from "../../shared/shared-directives.module";

@NgModule({
  imports: [CommonModule, ScrollingModule, CvCheckboxModule, FormsModule, CvInputModule, CvInputFieldModule, CvIconModule, SharedDirectivesModule],
  declarations: [CvSelectComponent, FilterByPipe, CvOverlayDirective, CvHolder],
  exports: [CvSelectComponent],
  entryComponents: [CvHolder],
  providers: [OverlayRef]
})
export class CvSelectModule {
}
