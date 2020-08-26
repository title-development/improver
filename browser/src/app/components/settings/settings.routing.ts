import { RouterModule, Routes } from '@angular/router';
import { ContractorGuard } from '../../auth/router-guards/contractor.guard';
import { UserGuard } from '../../auth/router-guards/user.guard';
import { NotificationGuard } from '../../auth/router-guards/notification.guard';
import { AuthGuard } from '../../auth/router-guards/auth.guard';
import { CustomerGuard } from '../../auth/router-guards/customer.guard';

const routes: Routes = [
  {
    path: 'my',  children: [
      {path: '', redirectTo: 'settings', pathMatch: 'full'},
      {
        path: 'settings', canActivateChild: [ AuthGuard, UserGuard ], children: [
          {path: '', redirectTo: 'account', pathMatch: 'full'},
          {
            path: 'account',
            loadChildren: () => import('./shared/personal-info/personal-info.module').then(m => m.PersonalInfoModule),
            canActivate: [CustomerGuard]
          },
          {
            path: 'notifications',
            loadChildren: () => import('./customer-account/customer-notifications/customer-notifications.module').then(m => m.CustomerNotificationsModule),
            canActivate: [NotificationGuard]
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
            path: 'account',
            loadChildren: () => import('./shared/personal-info/personal-info.module').then(m => m.PersonalInfoModule)
          },
          {
            path: 'info',
            loadChildren: () => import('./contractor-account/company-info/company-info.module').then(m => m.CompanyInfoModule)
          },
          {
            path: 'services',
            loadChildren: () => import('./contractor-account/lead-preference/lead-preference.module').then(m => m.LeadPreferenceModule)
          },
          {
            path: 'coverage',
            loadChildren: () => import('./contractor-account/service-area/service-area.module').then(m => m.ServiceAreaModule)
          },
          {
            path: 'billing',
            loadChildren: () => import('./contractor-account/billing/billing.module').then(m => m.BillingModule)
          },
          {
            path: 'notifications',
            loadChildren: () => import('./contractor-account/communication-settings/communication-settings.module').then(m => m.CommunicationSettingsModule)
          }
        ]
      }
    ]
  }
];

export const settingsRouting = RouterModule.forChild(routes);
