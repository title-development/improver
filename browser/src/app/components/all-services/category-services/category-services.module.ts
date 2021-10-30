import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CategoryServicesComponent } from "./category-services.component";
import { CvInputModule } from "../../../theme/input/cv-input.module";
import { SharedModule } from "../../../shared/shared.module";
import { LayoutModule } from "../../../layout/layout.module";
import { HomeModule } from "../../home/home.module";


const routes = RouterModule.forChild([
  {
    path: '', redirectTo: '/404', pathMatch: 'full'
  },
  {
    path: ':tradeId',
    component: CategoryServicesComponent
  }
]);

@NgModule({
  imports: [
    routes,
    SharedModule,
    CvInputModule,
    LayoutModule,
    HomeModule
  ],
  declarations: [
    CategoryServicesComponent
  ]
})
export class CategoryServicesModule {
}
