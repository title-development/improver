import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestorePasswordComponent } from "./restore-password.component";
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { CvInputFieldModule } from "../../theme/input-field/form-field.module";
import { CvFieldsModule } from "../../theme/fields/cv-fields.module";
import { CvIconModule } from "../../theme/icon/cv-icon-module";
import { CvButtonModule } from "../../theme/button/cv-button.module";
import { CvInputModule } from "../../theme/input/cv-input.module";

const restorePasswordRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: RestorePasswordComponent
  },
  {
    path: ':token',
    component: RestorePasswordComponent
  }
]);



@NgModule({
  imports: [
    restorePasswordRouting,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    CvIconModule,
    CvFieldsModule
  ],
  declarations: [
    RestorePasswordComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    RestorePasswordComponent
  ]
})


export class RestorePasswordModule {}
