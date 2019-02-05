import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerProjectViewComponent } from "./customer-project-view.component";
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from '../../../layout/layout.module';
import { CvSpinnerModule } from '../../../theme/spinner/cv-spinner.module';
import {NgArrayPipesModule, SomePipe} from "angular-pipes";

const customerProjectViewRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CustomerProjectViewComponent,
  }
]);

@NgModule({
  imports: [
    customerProjectViewRouting,
    SharedModule,
    LayoutModule,
    CvSpinnerModule,
    NgArrayPipesModule
  ],
  declarations: [
    CustomerProjectViewComponent,
  ],
  providers: [
    SomePipe
  ]
})

export class CustomerProjectViewModule {}
