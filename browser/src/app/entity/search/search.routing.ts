import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search.component';
import { ModuleWithProviders } from '@angular/core';

const routes: Routes = [{
  path: '', component: SearchComponent
}];

export const SEARCH_ROUTES: ModuleWithProviders = RouterModule.forChild(routes);
