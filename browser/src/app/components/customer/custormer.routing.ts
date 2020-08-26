import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full'},
  { path: 'projects/:id', data: {reuse: true}, loadChildren: () => import('./customer-project-view/customer-project-view.module').then(m => m.CustomerProjectViewModule) },
  { path: 'projects', loadChildren: () => import('./customer-projects/customer-projects.module').then(m => m.CustomerProjectsModule) },
];

export const customerRouting = RouterModule.forChild(routes);
