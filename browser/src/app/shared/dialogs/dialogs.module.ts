import { NgModule } from '@angular/core';
import { QuestionaryFormQuestionComponent } from './questionary-dialog/questionary-form/questionary-form-question/questionary-form-question.component';
import { DefaultQuestionaryBlockComponent } from './questionary-dialog/questionary-form/default-questionary-block/default-questionary-block.component';
import { QuestionaryFormComponent } from './questionary-dialog/questionary-form/questionary-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { CvButtonModule } from '../../theme/button/cv-button.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';
import { CvSelectModule } from '../../theme/select/cv-select-module';
import { CvFieldsModule } from '../../theme/fields/cv-fields.module';
import { CvInputModule } from '../../theme/input/cv-input.module';
import { CvInputFieldModule } from '../../theme/input-field/form-field.module';
import { CvDatePickerModule } from '../../theme/date-picker/cv-date-picker.module';
import { CvRadioModule } from '../../theme/radio/radio.module';
import { CvSpinnerModule } from '../../theme/spinner/cv-spinner.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { LocationValidateService } from '../../api/services/location-validate.service';
import { CvCheckboxModule } from '../../theme/checkbox/checkbox.module';
import { dialogs } from './dialogs.state';
import { CvDateRangePickerModule } from '../../theme/date-range-picker/cv-date-range-picker.module';
import { BoundariesService } from '../../api/services/boundaries.service';
import { ReferralService } from '../../api/services/referral.service';
import { ClipboardModule } from 'ngx-clipboard';
import { MatDialogModule } from '@angular/material/dialog';
import { PreQuestionaryBlock } from "./questionary-dialog/questionary-form/pre-questionary-block/pre-questionary-block";
import { NgReplacePipeModule } from "angular-pipes";
import { CompanyInfoService } from "../../api/services/company-info.service";
import { SocialButtonsModule } from "../../auth/social-buttons/social-buttons.module";
import { RecaptchaModule } from "ng-recaptcha";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    SharedModule,
    CvButtonModule,
    CvIconModule,
    CvSelectModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
    CvDatePickerModule,
    CvRadioModule,
    CvCheckboxModule,
    CvSpinnerModule,
    CvDateRangePickerModule,
    PerfectScrollbarModule,
    ClipboardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgReplacePipeModule,
    SocialButtonsModule,
    RecaptchaModule
  ],
  declarations: [
    QuestionaryFormComponent,
    QuestionaryFormQuestionComponent,
    DefaultQuestionaryBlockComponent,
    PreQuestionaryBlock,
    ...dialogs
  ],
  entryComponents: [
  ],
  providers: [
    LocationValidateService,
    BoundariesService,
    ReferralService,
    CompanyInfoService
  ]
})
export class DialogsModule {

}
