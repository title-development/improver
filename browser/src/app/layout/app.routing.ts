import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../entity/not-found/not-found.component';
import { AuthGuard } from '../auth/router-guards/auth.guard';
import { NotAuthenticatedGuard } from '../auth/router-guards/notAuthenticated.guard';
import { ForbiddenComponent } from '../entity/forbidden/forbidden.component';
import { ContractorGuard } from '../auth/router-guards/contractor.guard';
import { CustomerGuard } from '../auth/router-guards/customer.guard';
import { UserGuard } from '../auth/router-guards/user.guard';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from '../entity/home/home.component';
import { InformationComponent } from "../entity/information/information.component";
import { ContractorHomeGuard } from "../auth/router-guards/contractor-home.guard";
import { InternalServerErrorComponent } from '../entity/internal-server-error/internal-server-error.component';

const routes: Routes = [
  { path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [ContractorHomeGuard] },
      { path: 'login', loadChildren: '../auth/login/login.module#LoginModule', canActivate: [ NotAuthenticatedGuard ]},
      { path: 'signup', loadChildren: '../auth/signup/signup.module#SignupModule', canActivate: [ NotAuthenticatedGuard ]},
      { path: 'signup-pro', loadChildren: '../auth/signup-pro/signup-pro.module#SignupProModule', canActivate: [ NotAuthenticatedGuard ]},
      { path: 'become-pro', loadChildren: '../auth/become-pro/become-pro.module#BecomeProModule', canActivate: [ NotAuthenticatedGuard ]},
      { path: 'restore-password', loadChildren: '../auth/restore-password/restore-password.module#RestorePasswordModule', canActivate: [ NotAuthenticatedGuard ]},
      { path: 'confirm', loadChildren: '../auth/confirmation/confirmation.module#ConfirmationModule'},
      { path: 'services', loadChildren: '../entity/all-services/all-services.module#AllServicesModule'},
      { path: 'category', loadChildren: '../entity/all-services/category-services/category-services.module#CategoryServicesModule'},
      { path: 'my', loadChildren: '../entity/customer/customer.module#CustomerModule', canActivateChild: [ AuthGuard, CustomerGuard ] },
      { path: 'pro', loadChildren: '../entity/contractor/contractor.module#ContractorModule',   canActivateChild: [ AuthGuard, ContractorGuard ] },
      { path: '', loadChildren: '../entity/settings/account.module#AccountModule', canActivate: [ AuthGuard, UserGuard ]},
      { path: 'companies', loadChildren: '../entity/company/company.module#CompanyModule' },
      { path: 'search', loadChildren: '../entity/search/search.module#SearchModule'},
      { path: 'my/review-revision', loadChildren: '../entity/review-revision/review-revision.module#ReviewRevisionModule', canActivateChild: [AuthGuard, CustomerGuard]},
      { path: 'ticket', loadChildren: '../shared/ticket/ticket.module#TicketModule'},
      { path: 'privacy-policy', component: InformationComponent },
      { path: 'terms-of-use', component: InformationComponent }
    ]
  },
  { path: 'admin', loadChildren: '../entity/admin/admin.module#AdminModule'},
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '500', component: InternalServerErrorComponent },
  { path: '**', component: PageNotFoundComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' });


