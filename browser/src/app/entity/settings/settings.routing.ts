import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractorGuard } from '../../auth/router-guards/contractor.guard';
import { UserGuard } from '../../auth/router-guards/user.guard';
import { PendingChangesGuard } from '../../auth/router-guards/pending-chanes.guard';
import { NotificationGuard } from '../../auth/router-guards/notification.guard';
import { AuthGuard } from '../../auth/router-guards/auth.guard';
import { CustomerGuard } from '../../auth/router-guards/customer.guard';

const routes: Routes = [
  {
    path: 'my',  children: [
      {path: '', redirectTo: 'settings', pathMatch: 'full'},
      {
        path: 'settings', canActivateChild: [ AuthGuard, CustomerGuard ], children: [
          {path: '', redirectTo: 'account', pathMatch: 'full'},
          {
            path: 'account',
            loadChildren: 'app/entity/settings/shared/personal-info/personal-info.module#PersonalInfoModule',
            canActivate: [UserGuard]
          },
          {
            path: 'notifications',
            loadChildren: 'app/entity/settings/customer-account/customer-notifications/customer-notifications.module#CustomerNotificationsModule',
            canActivate: [UserGuard, NotificationGuard]
          }
        ]
      }
    ]
  },
  {
    path: 'pro', children: [
      {path: '', redirectTo: 'settings', pathMatch: 'full'},
      {
        path: 'settings', canActivateChild: [ AuthGuard, ContractorGuard ], children: [
          {path: '', pathMatch: 'full', redirectTo: 'info'},
          {
            path: 'info',
            loadChildren: 'app/entity/settings/contractor-account/company-info/company-info.module#CompanyInfoModule'
          },
          {
            path: 'services',
            loadChildren: 'app/entity/settings/contractor-account/trades-and-services/trades-and-services.module#TradesAndServicesModule'
          },
          {
            path: 'coverage',
            loadChildren: 'app/entity/settings/contractor-account/service-area/service-area.module#ServiceAreaModule'
          },
          {
            path: 'billing', loadChildren: 'app/entity/settings/contractor-account/billing/billing.module#BillingModule'
          },
          {
            path: 'notifications',
            loadChildren: 'app/entity/settings/contractor-account/contractor-notifications/contractor-notifications.module#ContractorNotificationsModule'
          },
          {
            path: 'quick-reply',
            loadChildren: 'app/entity/settings/contractor-account/quick-reply/quick-reply.module#QuickReplyModule'
          },
          {
            path: 'scheduling-availability',
            loadChildren: 'app/entity/settings/contractor-account/scheduling/scheduling-availability.module#SchedulingAvailabilityModule'
          },
        ]
      }
    ]
  }
];

export const SETTINGS_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
