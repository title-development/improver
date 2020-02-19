import { ModuleWithProviders, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { InvoiceComponent } from './invoice.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../util/constants';
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from "../../../layout/layout.module";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: InvoiceComponent
  }
]);

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    routing,
    LayoutModule,
    FlexLayoutModule
  ],
  declarations: [
    InvoiceComponent
  ],
  providers: [Constants]
})
export class InvoiceModule {
}




