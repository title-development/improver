import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AllServicesComponent } from "./all-services.component";
import { SharedModule } from "../../shared/shared.module";
import { CvInputModule } from "../../theme/input/cv-input.module";
import { LayoutModule } from "../../layout/layout.module";

const routes = RouterModule.forChild([
  {
    path: '',
    component: AllServicesComponent
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
    AllServicesComponent
  ]
})
export class AllServicesModule {
}
