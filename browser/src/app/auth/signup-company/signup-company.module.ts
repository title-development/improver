import { ModuleWithProviders, NgModule } from '@angular/core';
import { SignupCompanyComponent } from './signup-company.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CvInputModule } from '../../theme/input/cv-input.module';
import { CvInputFieldModule } from '../../theme/input-field/form-field.module';
import { CvButtonModule } from '../../theme/button/cv-button.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';
import { CvFieldsModule } from '../../theme/fields/cv-fields.module';
import { CvCheckboxModule } from '../../theme/checkbox/checkbox.module';
import { CvSelectModule } from '../../theme/select/cv-select-module';
import { AgmSharedModule } from '../../shared/agmShared.module';
import { SocialButtonsModule } from '../social-buttons/social-buttons.module';

export const signupCompanyRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: SignupCompanyComponent
  }
]);

@NgModule({
  imports: [
    signupCompanyRouting,
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
  declarations: [SignupCompanyComponent],
  providers: [],
  exports: []
})
export class SignupCompanyModule {

}
