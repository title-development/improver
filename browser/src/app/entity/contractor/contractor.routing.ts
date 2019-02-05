import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: './contractor-dashboard/contractor-dashboard.module#ContractorDashboardModule' },
  {
    path: 'projects/:projectRequestId',
    loadChildren: './contractor-project-view/contractor-project-view.module#ContractorProjectViewModule',
    data: {reuse: false},
  },
  {
    path: 'leads-search',
    loadChildren: './contractor-leads-search/contractor-leads-search.module#ContractorLeadsSearchModule'
  },
  {
    path: 'leads-purchase/:uid',
    loadChildren: './contractor-lead-purchase/contractor-lead-purchase.module#ContractorLeadPurchaseModule'
  },
  {
    path: 'subscription-actions/:mode',
    loadChildren: './subscription-actions/subscription-actions.module#SubscriptionActionsModule'
  },
  {
    path: 'receipt/:mode/:receiptId',
    loadChildren: './invoice/invoice.module#InvoiceModule'
  },
];

export const CONTRACTOR_ROUTES = RouterModule.forChild(routes);
