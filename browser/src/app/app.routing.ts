import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './entity/not-found/not-found.component';
import { AuthGuard } from './auth/router-guards/auth.guard';
import { NotAuthenticatedGuard } from './auth/router-guards/notAuthenticated.guard';
import { ForbiddenComponent } from './entity/forbidden/forbidden.component';
import { ContractorGuard } from './auth/router-guards/contractor.guard';
import { CustomerGuard } from './auth/router-guards/customer.guard';
import { UserGuard } from './auth/router-guards/user.guard';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './entity/home/home.component';
import { ContractorHomeGuard } from "./auth/router-guards/contractor-home.guard";
import { InternalServerErrorComponent } from './entity/internal-server-error/internal-server-error.component';
import { IncompleteProGuard } from './auth/router-guards/incomplete-pro.guard';

const routes: Routes = [
  { path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [ContractorHomeGuard] },
      { path: 'login', loadChildren: () => import('./auth/login/login.module').then(m => m.LoginModule), canActivate: [ NotAuthenticatedGuard ]},
      { path: 'signup', loadChildren: () => import('./auth/signup/signup.module').then(m => m.SignupModule), canActivate: [ NotAuthenticatedGuard ]},
      { path: 'signup/email-verification-hint', loadChildren: () => import('./auth/email-verification-hint/email-verification-hint.module').then(m => m.EmailVerificationHintModule)},
      { path: 'signup-pro', loadChildren: () => import('./auth/signup-pro/signup-pro.module').then(m => m.SignupProModule), canActivate: [ NotAuthenticatedGuard ]},
      { path: 'signup-pro/company', loadChildren: () => import('./auth/signup-company/signup-company.module').then(m => m.SignupCompanyModule), canActivate: [ IncompleteProGuard ]},
      { path: 'become-pro', loadChildren: () => import('./auth/become-pro/become-pro.module').then(m => m.BecomeProModule), canActivate: [ NotAuthenticatedGuard ]},
      { path: 'restore-password', loadChildren: () => import('./auth/restore-password/restore-password.module').then(m => m.RestorePasswordModule), canActivate: [ NotAuthenticatedGuard ]},
      { path: 'confirm', loadChildren: () => import('./auth/confirmation/confirmation.module').then(m => m.ConfirmationModule)},
      { path: 'services', loadChildren: () => import('./entity/all-services/all-services.module').then(m => m.AllServicesModule)},
      { path: 'category', loadChildren: () => import('./entity/all-services/category-services/category-services.module').then(m => m.CategoryServicesModule)},
      { path: 'my', loadChildren: () => import('./entity/customer/customer.module').then(m => m.CustomerModule), canActivateChild: [ AuthGuard, CustomerGuard ] },
      { path: 'pro', loadChildren: () => import('./entity/contractor/contractor.module').then(m => m.ContractorModule),   canActivateChild: [ AuthGuard, ContractorGuard ] },
      { path: '', loadChildren: () => import('./entity/settings/account.module').then(m => m.AccountModule), canActivate: [ AuthGuard, UserGuard ]},
      { path: 'companies', loadChildren: () => import('./entity/company/company.module').then(m => m.CompanyModule)},
      { path: 'search', loadChildren: () => import('./entity/search/search.module').then(m => m.SearchModule)},
      { path: 'my/review-revision', loadChildren:  () => import('./entity/review-revision/review-revision.module').then(m => m.ReviewRevisionModule), canActivateChild: [AuthGuard, CustomerGuard]},
      { path: 'ticket', loadChildren: () => import('./shared/ticket/ticket.module').then(m => m.TicketModule)},
      { path: 'privacy-policy', loadChildren: () => import('./entity/information/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)},
      { path: 'terms-of-use', loadChildren: () => import('./entity/information/terms-of-use/terms-of-use.module').then(m => m.TermsOfUseModule)}
    ]
  },
  { path: 'admin', loadChildren: () => import('./entity/admin/admin.module').then(m => m.AdminModule)},
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '500', component: InternalServerErrorComponent },
  { path: '**', component: PageNotFoundComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' });


