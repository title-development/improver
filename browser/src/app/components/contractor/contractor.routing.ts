import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => import('./contractor-dashboard/contractor-dashboard.module').then(m => m.ContractorDashboardModule)},
  {
    path: 'projects/:projectRequestId',
    loadChildren: () => import('./contractor-project-view/contractor-project-view.module').then(m => m.ContractorProjectViewModule),
    data: {reuse: false},
  },
  {
    path: 'leads-search',
    loadChildren: () => import('./contractor-leads-search/contractor-leads-search.module').then(m => m.ContractorLeadsSearchModule)
  },
  {
    path: 'leads-purchase/:uid',
    loadChildren: () => import('./contractor-lead-purchase/contractor-lead-purchase.module').then(m => m.ContractorLeadPurchaseModule)
  },
  {
    path: 'subscription-actions/:mode',
    data: {reuse: false},
    loadChildren: () => import('./subscription-actions/subscription-actions.module').then(m => m.SubscriptionActionsModule)
  },
  {
    path: 'receipt/:mode/:receiptId',
    loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule)
  },
];

export const CONTRACTOR_ROUTES = RouterModule.forChild(routes);
