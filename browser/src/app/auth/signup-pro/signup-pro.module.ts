import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupProComponent } from "./signup-pro.component";
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { CvInputModule } from "../../theme/input/cv-input.module";
import { CvIconModule } from "../../theme/icon/cv-icon-module";
import { CvButtonModule } from "../../theme/button/cv-button.module";
import { CvInputFieldModule } from '../../theme/input-field/form-field.module';
import { CvFieldsModule } from '../../theme/fields/cv-fields.module';
import { CvCheckboxModule } from "../../theme/checkbox/checkbox.module";
import { CvSelectModule } from "../../theme/select/cv-select-module";
import { AgmSharedModule } from "../../shared/agmShared.module";
import { SocialButtonsModule } from '../social-buttons/social-buttons.module';

const signupProRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: SignupProComponent
  }
]);

@NgModule({
  imports: [
    signupProRouting,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    CvIconModule,
    CvFieldsModule,
    CvCheckboxModule,
    CvSelectModule,
    AgmSharedModule,
    SocialButtonsModule
  ],
  declarations: [
    SignupProComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    SignupProComponent
  ]
})


export class SignupProModule {}
