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
    loadChildren: './company-profile/company-profile.module#CompanyProfileModule'
  },
  {
    path: ':companyId/projects/:projectId/view',
    loadChildren: './company-demo-project-viewer/company-demo-project-viewer.module#CompanyDemoProjectViewerModule',
    canActivate: [AuthGuard]
  },
  {
    path: ':companyId/projects/:projectId/:mode',
    loadChildren: './company-demo-project-editor/company-demo-project-editor.module#CompanyDemoProjectEditorModule',
    canActivate: [AuthGuard, ContractorGuard]
  },
  {
    path: ':companyId/projects/:projectId/:mode',
    loadChildren: './company-demo-project-editor/company-demo-project-editor.module#CompanyDemoProjectEditorModule',
    canActivate: [AuthGuard, ContractorGuard]
  }

];

export const COMPANIES_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
