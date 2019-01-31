import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminLoginComponent } from './login/login.component';
import { QuestionaryListComponent } from './questionary/questionary-list/questionary.component';
import { AdminUsersComponent } from './users/users-list/users.component';
import { AdminLayoutComponent } from './layout/layout.component';
import { AdminGuard } from '../../auth/router-guards/admin.guard';
import { NotAuthenticatedGuard } from '../../auth/router-guards/notAuthenticated.guard';
import { CompaniesComponent } from './companies/companies-list/companies.component';
import { AdminSettingsComponent } from './settings/settings.component';
import { AdminReviewsComponent } from './reviews/reviews.component';
import { QuestionaryEditComponent } from './questionary/questionary-edit/questionary-edit.component';

import { TradesListComponent } from './trades/trades-list/trades-list.component';
import { TradesEditComponent } from './trades/trades-edit/trades-edit.component';
import { ServicesListComponent } from './services/services-list/services-list.component';
import { ServicesEditComponent } from './services/services-edit/services-edit.component';
import { AdminProjectsValidationComponent } from './projects/projects-validation/projects-validation.component';
import { AdminProjectsComponent } from './projects/projects-list/projects-list.component';
import { ContractorsComponent } from './users/contractors-list/contractors.component';
import { CustomersListComponent } from './users/customers-list/customers-list.component';
import { RefundsListComponent } from './refunds/refunds-list/refunds-list.component';
import { RefundsInreviewComponent } from './refunds/inreview/inreview.component';
import { TicketsListComponent } from './tickets/tickets-list/tickets.component';
import { TicketsInreviewComponent } from './tickets/inreview/inreview.component';
import { SupportGuard } from '../../auth/router-guards/support.guard';
import { ProjectRequestsComponent } from './projects/requests/project-requests.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { AdminAccountComponent } from './account/admin-account.component';
import { LicenseTypesComponent } from "./license-types/license-types.component";
import { AdminCoverageComponent } from './coverage/admin-coverage.component';
import { AdminJobsComponent } from "./jobs/jobs.component";
import { AuthGuard } from '../../auth/router-guards/auth.guard';
import { MyTicketsComponent } from "./tickets/my/my-tickets.component";

const routes: Routes = [
  {
    path: '', component: AdminComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {
        path: '', component: AdminLayoutComponent, canActivateChild: [AuthGuard, AdminGuard],
        children: [
          {path: 'account', component: AdminAccountComponent},
          {path: 'dashboard', component: AdminDashboardComponent},
          {path: 'users', component: AdminUsersComponent},
          {path: 'users/new', component: AddUserComponent},
          {path: 'contractors', component: ContractorsComponent},
          {path: 'customers', component: CustomersListComponent},
          {path: 'invitations', component: InvitationsComponent},
          {path: 'project-requests', component: ProjectRequestsComponent},
          {path: 'companies', component: CompaniesComponent},
          {path: 'projects', component: AdminProjectsComponent},
          {path: 'projects-validation', component: AdminProjectsValidationComponent},
          {path: 'reviews', component: AdminReviewsComponent},
          {path: 'trades', component: TradesListComponent},
          {path: 'trades/:mode/:id', component: TradesEditComponent},
          {path: 'trades/:mode', component: TradesEditComponent},
          {path: 'services', component: ServicesListComponent},
          {path: 'services/:mode/:id', component: ServicesEditComponent},
          {path: 'services/:mode', component: ServicesEditComponent},
          {path: 'questionaries', component: QuestionaryListComponent},
          {path: 'questionaries/:mode/:id', component: QuestionaryEditComponent},
          {path: 'questionaries/:mode', component: QuestionaryEditComponent},
          {path: 'refunds', component: RefundsListComponent},
          {path: 'refunds/inreview', component: RefundsInreviewComponent},
          {path: 'coverage', component: AdminCoverageComponent},
          {path: 'tickets/my', component: MyTicketsComponent},
          {path: 'tickets/unassigned', component: TicketsInreviewComponent},
          {path: 'tickets', component: TicketsListComponent},
          {path: 'license-types', component: LicenseTypesComponent},
          {path: 'jobs', component: AdminJobsComponent},
          {path: 'settings', component: AdminSettingsComponent}
        ]
      },
      {path: 'login', component: AdminLoginComponent, canActivate: [NotAuthenticatedGuard]}
    ]
  }
];

export const ADMIN_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
