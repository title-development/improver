import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MainSearchComponent } from './main-search/main-search.component';
import { MainGuideComponent } from './main-guide/main-guide.component';
import { CustomerBannerComponent } from './customer-banner/customer-banner.component';
import { HiwWizardComponent } from './hiw-wizard/hiw-wizard.component';
import { GeneralInfoComponent } from './general-info/general-info.component';

import { QuestionaryControlService } from '../../api/services/questionary-control.service';
import { CustomerService } from '../../api/services/customer.service';
import { GeolocationService } from '../../api/services/geolocation.service';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';
import { CvSelectModule } from '../../theme/select/cv-select-module';
import { AdvertisementBlockComponent } from "./advertisement-block/advertisement-block.component";
import { AdvertisementBlockElementComponent } from './advertisement-block/advertisement-block-element/advertisement-block-element.component';
import { NgTakePipeModule } from "angular-pipes";

@NgModule({
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatAutocompleteModule,
    MatCardModule,
    LayoutModule,
    CvSelectModule,
    NgTakePipeModule
  ],
  declarations: [
    HomeComponent,
    MainSearchComponent,
    MainGuideComponent,
    AdvertisementBlockComponent,
    CustomerBannerComponent,
    HiwWizardComponent,
    GeneralInfoComponent,
    AdvertisementBlockElementComponent
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
    AdvertisementBlockComponent,
    CustomerBannerComponent,
    HiwWizardComponent,
    GeneralInfoComponent
  ]
})

export class HomeModule {
}
