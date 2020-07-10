import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceComponent } from './invoice.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Constants } from '../../../util/constants';
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from "../../../layout/layout.module";

const routing = RouterModule.forChild([
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




