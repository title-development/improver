import { ModuleWithProviders, NgModule,  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CampaignSettingsComponent } from "./campaign-settings.component";
import { SharedModule } from '../../../../shared/shared.module';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CampaignSettingsComponent
  }
]);

@NgModule({
  imports: [
    routing,
    SharedModule
  ],
  declarations: [CampaignSettingsComponent],
  exports: [],
  providers: []
})

export class CampaignSettingsModule {}
