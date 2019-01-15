import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BecomeProComponent } from "./become-pro.component";
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { CvInputModule } from "../../theme/input/cv-input.module";
import { CvIconModule } from "../../theme/icon/cv-icon-module";
import { CvButtonModule } from "../../theme/button/cv-button.module";
import { CvInputFieldModule } from '../../theme/input-field/form-field.module';
import { CvFieldsModule } from '../../theme/fields/cv-fields.module';
import { LayoutModule } from '../../layout/layout.module';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: BecomeProComponent
  }
]);

@NgModule({
  imports: [
    routing,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    CvIconModule,
    CvFieldsModule,
    LayoutModule,
  ],
  declarations: [
    BecomeProComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    BecomeProComponent
  ]
})


export class BecomeProModule {}
