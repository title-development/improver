import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { CvInputModule } from '../../theme/input/cv-input.module';
import { CvButtonModule } from '../../theme/button/cv-button.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';
import { CvInputFieldModule } from '../../theme/input-field/form-field.module';
import { CvFieldsModule } from '../../theme/fields/cv-fields.module';
import { SocialButtonsModule } from '../social-buttons/social-buttons.module';
import { RecaptchaModule } from 'ng-recaptcha';

const loginRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: LoginComponent
  }
]);

@NgModule({
  imports: [
    loginRouting,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    CvIconModule,
    CvFieldsModule,
    SocialButtonsModule,
    RecaptchaModule,
  ],
  declarations: [
    LoginComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    LoginComponent
  ]
})


export class LoginModule {}
