import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '../../auth/router-guards/auth.guard';
import { ContractorGuard } from '../../auth/router-guards/contractor.guard';

const routes: Routes = [
  {
    path: '', redirectTo: '/404', pathMatch: 'full'
  },
  {
    path: ':companyId',
    loadChildren: () => import('./company-profile/company-profile.module').then(m => m.CompanyProfileModule)
  },
  {
    path: ':companyId/projects/view/:projectId',
    loadChildren: () => import('./company-demo-project-viewer/company-demo-project-viewer.module').then(m => m.CompanyDemoProjectViewerModule),
    canActivate: [AuthGuard]
  },
  {
    path: ':companyId/projects/:mode/:projectId',
    loadChildren: () => import('./company-demo-project-editor/company-demo-project-editor.module').then(m => m.CompanyDemoProjectEditorModule),
    canActivate: [AuthGuard, ContractorGuard]
  },
  {
    path: ':companyId/projects/:mode',
    loadChildren: () => import('./company-demo-project-editor/company-demo-project-editor.module').then(m => m.CompanyDemoProjectEditorModule),
    canActivate: [AuthGuard, ContractorGuard]
  }
];

export const COMPANIES_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
