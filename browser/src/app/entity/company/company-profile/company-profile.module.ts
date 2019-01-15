import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyProfileComponent } from "./company-profile.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";

import {
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatButtonModule,
  MatInputModule,
  MatMenuModule,
  MatRadioModule
} from "@angular/material";

import { CompanyReviewItemComponent } from "./company-reviews/company-review-item/company-review-item.component";
import { AccountService } from '../../../api/services/account.service';
import { GalleryProjectService } from '../../../api/services/gallery-project.service';
import { SharedModule } from '../../../shared/shared.module';
import { AgmSharedModule } from "../../../shared/agmShared.module";
import { LayoutModule } from "../../../layout/layout.module";
import { CompanyProjectsGalleryComponent } from './company-projects-gallery/company-projects-gallery.component';
import { CvButtonModule } from '../../../theme/button/cv-button.module';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CompanyProfileComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    routing,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatMenuModule,
    FlexLayoutModule,
    FormsModule,
    LayoutModule,
    SharedModule,
    AgmSharedModule,
    CvButtonModule
  ],
  declarations: [
    CompanyProfileComponent,
    CompanyProjectsGalleryComponent
  ],
  exports: [],
  providers: [
    AccountService,
    GalleryProjectService
  ]
})

export class CompanyProfileModule {}





