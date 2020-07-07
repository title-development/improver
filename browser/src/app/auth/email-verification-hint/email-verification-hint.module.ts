import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../api/services/customer.service';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';
import { EmailVerificationHintComponent } from "./email-verification-hint.component";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: EmailVerificationHintComponent
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
    EmailVerificationHintComponent
  ],
  providers: [
    CustomerService
  ],
  bootstrap: [
    EmailVerificationHintComponent
  ]
})


export class EmailVerificationHintModule {}
