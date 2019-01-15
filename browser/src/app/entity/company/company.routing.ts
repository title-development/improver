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
    loadChildren: './company-gallery-project-viewer/company-gallery-project-viewer.module#CompanyGalleryProjectViewerModule', canActivate: [ AuthGuard ]
  },
  {
    path: ':companyId/projects/:projectId/:mode',
    loadChildren: './company-gallery-project-editor/company-gallery-project-editor.module#CompanyGalleryProjectEditorModule', canActivate: [ AuthGuard, ContractorGuard ]
  },
  {
    path: ':companyId/projects/:projectId/:mode',
    loadChildren: './company-gallery-project-editor/company-gallery-project-editor.module#CompanyGalleryProjectEditorModule', canActivate: [ AuthGuard, ContractorGuard ]
  }

];

export const COMPANIES_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
