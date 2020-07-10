import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { BillingTransactionsComponent } from './billing-transactions/billing-transactions.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../../../shared/shared.module';
import { CvButtonModule } from '../../../../theme/button/cv-button.module';
import { CvInputModule } from '../../../../theme/input/cv-input.module';
import { CvInputFieldModule } from '../../../../theme/input-field/form-field.module';
import { CvFieldsModule } from '../../../../theme/fields/cv-fields.module';
import { CvIconModule } from '../../../../theme/icon/cv-icon-module';
import { LayoutModule } from '../../../../layout/layout.module';

const routing = RouterModule.forChild([
  {
    path: '',
    component: BillingComponent
  }
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule,
    FormsModule,
    MatAutocompleteModule,
    SharedModule,
    LayoutModule,
    SharedModule,
    CvButtonModule,
    CvInputModule,
    CvInputFieldModule,
    CvFieldsModule,
    CvIconModule
  ],
  declarations: [
    BillingComponent,
    PaymentMethodComponent,
    BillingTransactionsComponent,
  ],
  exports: [],
  providers: []
})

export class BillingModule {
}
