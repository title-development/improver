import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MainSearchComponent } from './main-search/main-search.component';
import { MainGuideComponent } from './main-guide/main-guide.component';
import { PopularServicesComponent } from './popular-services/popular-services.component';
import { CustomerBannerComponent } from './customer-banner/customer-banner.component';
import { HiwWizardComponent } from './hiw-wizard/hiw-wizard.component';
import { GeneralInfoComponent } from './general-info/general-info.component';
import { HomeFooterComponent } from './home-footer/home-footer.component';
import { QuestionaryControlService } from '../../util/questionary-control.service';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { CustomerService } from '../../api/services/customer.service';
import { GeolocationService } from '../../api/services/geolocation.service';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';
import { CvSelectModule } from '../../theme/select/cv-select-module';

@NgModule({
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatAutocompleteModule,
    MatCardModule,
    LayoutModule,
    CvSelectModule
  ],
  declarations: [
    HomeComponent,
    MainSearchComponent,
    MainGuideComponent,
    PopularServicesComponent,
    CustomerBannerComponent,
    HiwWizardComponent,
    GeneralInfoComponent,
    HomeFooterComponent
  ],
  providers: [
    CustomerService,
    GeolocationService,
    QuestionaryControlService
  ],
  bootstrap: [
    HomeComponent,
    MainSearchComponent,
    MainGuideComponent,
    PopularServicesComponent,
    CustomerBannerComponent,
    HiwWizardComponent,
    GeneralInfoComponent,
    HomeFooterComponent
  ]
})

export class HomeModule {
}
