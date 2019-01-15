import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionActionsComponent } from './subscription-actions.component';
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from '../../../layout/layout.module';
import { CvButtonModule } from '../../../theme/button/cv-button.module';
import { SubscriptionActionsService } from "./subscription-actions.service";



const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: SubscriptionActionsComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    routing,
    CvButtonModule,
    LayoutModule,
    SharedModule,
  ],
  declarations: [SubscriptionActionsComponent],
  exports: [],
  providers: []
})

export class SubscriptionActionsModule {
}



