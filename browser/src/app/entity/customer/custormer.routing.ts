import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full'},
  { path: 'projects/:id', data: {reuse: true}, loadChildren: () => import('./customer-project-view/customer-project-view.module').then(m => m.CustomerProjectViewModule) },
  { path: 'projects', loadChildren: () => import('./customer-projects/customer-projects.module').then(m => m.CustomerProjectsModule) },
];

export const CUSTOMER_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
