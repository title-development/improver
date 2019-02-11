import { NgModule } from '@angular/core';
import { AuthGuard } from './router-guards/auth.guard';
import { NotAuthenticatedGuard } from './router-guards/notAuthenticated.guard';
import { ContractorGuard } from './router-guards/contractor.guard';
import { UserGuard } from './router-guards/user.guard';
import { CustomerGuard } from './router-guards/customer.guard';
import { AdminGuard } from './router-guards/admin.guard';
import { ContractorHomeGuard } from './router-guards/contractor-home.guard';
import { SupportGuard } from './router-guards/support.guard';
import {
  SocialLoginModule
} from 'angularx-social-login';
import { StakeholderGuard } from './router-guards/stakeholder.guard';
import { IncompleteProGuard } from './router-guards/incomplete-pro.guard';


@NgModule({
  imports: [
    SocialLoginModule
  ],
  declarations: [],
  exports: [],
  providers: [AuthGuard, NotAuthenticatedGuard, ContractorGuard, CustomerGuard, UserGuard, AdminGuard, SupportGuard, ContractorHomeGuard, StakeholderGuard, IncompleteProGuard]
})
export class AuthModule {

}
