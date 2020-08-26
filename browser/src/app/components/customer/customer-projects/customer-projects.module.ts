import { NgModule, } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerDashboardComponent } from "./customer-projects.component";
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from '../../../layout/layout.module';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";

const customerDashboardRouting = RouterModule.forChild([
  {
    path: '',
    component: CustomerDashboardComponent
  }
]);

@NgModule({
  imports: [
    customerDashboardRouting,
    SharedModule,
    LayoutModule,
    PerfectScrollbarModule
  ],
  declarations: [
    CustomerDashboardComponent,
  ],
  providers: []
})
export class CustomerProjectsModule {}


