import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationComponent } from './confirmation.component';
import { SharedModule } from '../../shared/shared.module';
import { CvInputFieldModule } from "../../theme/input-field/form-field.module";
import { CvFieldsModule } from "../../theme/fields/cv-fields.module";
import { CvIconModule } from "../../theme/icon/cv-icon-module";
import { CvInputModule } from "../../theme/input/cv-input.module";
import { CvButtonModule } from "../../theme/button/cv-button.module";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";

const customerActivationRouting = RouterModule.forChild([
  {
    path: '',
    component: ConfirmationComponent
  },
  {
    path: ':mode/:token',
    component: ConfirmationComponent
  }
]);

@NgModule({
  imports: [
    customerActivationRouting,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    CvIconModule,
    CvFieldsModule
  ],
  declarations: [ConfirmationComponent],
  providers: []
})

export class ConfirmationModule {}
