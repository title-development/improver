import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvSpinnerModule } from '../../../../../../theme/spinner/cv-spinner.module';
import { CvSwitchModule } from '../../../../../../theme/switch/switch.module';
import { BasicModeComponent } from './components/basic-mode/basic-mode.component';
import { ManualModeComponent } from './components/manual-mode/manual-mode.component';
import { CoverageConfigurationComponent } from './coverage-configuration.component';
import { CvInputFieldModule } from '../../../../../../theme/input-field/form-field.module';
import { CvFieldsModule } from '../../../../../../theme/fields/cv-fields.module';
import { CvSelectModule } from '../../../../../../theme/select/cv-select-module';
import { CvButtonModule } from '../../../../../../theme/button/cv-button.module';
import { SharedDirectivesModule } from '../../../../../../shared/shared-directives.module';
import { CvInputModule } from '../../../../../../theme/input/cv-input.module';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from "@angular/material/select";

@NgModule({
  imports: [
    CommonModule,
    CvSwitchModule,
    CvSpinnerModule,
    FormsModule,
    CvInputFieldModule,
    CvFieldsModule,
    CvSelectModule,
    CvButtonModule,
    SharedDirectivesModule,
    CvInputModule,
    RouterModule,
    MatSelectModule
  ],
  declarations: [
    CoverageConfigurationComponent,
    BasicModeComponent,
    ManualModeComponent,
  ],
  exports: [CoverageConfigurationComponent],
})
export class CoverageConfigurationModule {
}
