import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';
import { EmailVerificationComponent } from "./email-verification.component";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: EmailVerificationComponent
  }
]);

@NgModule({
  imports: [
    routing,
    RouterModule,
    SharedModule,
    LayoutModule,
  ],
  declarations: [
    EmailVerificationComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    EmailVerificationComponent
  ]
})


export class EmailVerificationModule {}
