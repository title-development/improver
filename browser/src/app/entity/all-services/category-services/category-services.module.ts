import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CategoryServicesComponent } from "./category-services.component";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { SharedModule } from "../../../shared/shared.module";
import { LayoutModule } from "../../../layout/layout.module";


const routes: ModuleWithProviders = RouterModule.forChild([
  {
    path: '', redirectTo: '/404', pathMatch: 'full'
  },
  {
    path: ':categoryId',
    component: CategoryServicesComponent
  }
]);

@NgModule({
  imports: [
    routes,
    SharedModule,
    CvInputModule,
    LayoutModule
  ],
  declarations: [
    CategoryServicesComponent
  ]
})
export class CategoryServicesModule {
}
