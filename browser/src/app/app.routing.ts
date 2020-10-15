import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/not-found/not-found.component';
import { AuthGuard } from './auth/router-guards/auth.guard';
import { NotAuthenticatedGuard } from './auth/router-guards/notAuthenticated.guard';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { ContractorGuard } from './auth/router-guards/contractor.guard';
import { CustomerGuard } from './auth/router-guards/customer.guard';
import { UserGuard } from './auth/router-guards/user.guard';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { ContractorHomeGuard } from "./auth/router-guards/contractor-home.guard";
import { InternalServerErrorComponent } from './components/internal-server-error/internal-server-error.component';
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
      { path: 'services', loadChildren: () => import('./components/all-services/all-services.module').then(m => m.AllServicesModule)},
      { path: 'category', loadChildren: () => import('./components/all-services/category-services/category-services.module').then(m => m.CategoryServicesModule)},
      { path: 'my', loadChildren: () => import('./components/customer/customer.module').then(m => m.CustomerModule), canActivateChild: [ AuthGuard, CustomerGuard ] },
      { path: 'pro', loadChildren: () => import('./components/contractor/contractor.module').then(m => m.ContractorModule),   canActivateChild: [ AuthGuard, ContractorGuard ] },
      { path: '', loadChildren: () => import('./components/settings/account.module').then(m => m.AccountModule), canActivate: [ AuthGuard, UserGuard ]},
      { path: 'companies', loadChildren: () => import('./components/company/company.module').then(m => m.CompanyModule)},
      { path: 'search', loadChildren: () => import('./components/search/search.module').then(m => m.SearchModule)},
      { path: 'my/review-revision', loadChildren:  () => import('./components/review-revision/review-revision.module').then(m => m.ReviewRevisionModule), canActivateChild: [AuthGuard, CustomerGuard]},
      { path: 'ticket', loadChildren: () => import('./shared/ticket/ticket.module').then(m => m.TicketModule)},
      { path: 'privacy-policy', loadChildren: () => import('./components/information/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)},
      { path: 'terms-of-use', loadChildren: () => import('./components/information/terms-of-use/terms-of-use.module').then(m => m.TermsOfUseModule)},
      { path: 'about-us', loadChildren: () => import('./components/information/about-us/about-us.module').then(m => m.AboutUsModule)}
    ]
  },
  { path: 'admin', loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)},
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '500', component: InternalServerErrorComponent },
  { path: '**', component: PageNotFoundComponent }
];

export const routing = RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' });


