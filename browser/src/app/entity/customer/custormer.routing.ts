import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full'},
  { path: 'projects/:id', loadChildren: './customer-project-view/customer-project-view.module#CustomerProjectViewModule' },
  { path: 'projects', loadChildren: './customer-projects/customer-projects.module#CustomerProjectsModule' },
];

export const CUSTOMER_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
