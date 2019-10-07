import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImagesUploaderComponent } from './image-uploader/image-uploader.component';
import { RatingComponent } from './rating-component/rating.component';
import { PhoneHelpComponent } from './phone-help/phone-help.component';

import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatTooltipModule
} from '@angular/material';

import { ResponseMessageComponent } from './response-message/response-message.component';
import { MessengerModule } from './messanger/messenger.module';
import { PipesModule } from '../pipes/pipes.module';
import { AccountNavComponent } from '../entity/settings/account-nav.component';
import { EqualValidator } from '../validators/equal-validator.directive';
import { FileUploadModule } from 'ng2-file-upload';
import { CvButtonModule } from '../theme/button/cv-button.module';
import { CvSpinnerModule } from 'app/theme/spinner/cv-spinner.module';
import { CompanyReviewsComponent } from '../entity/company/company-profile/company-reviews/company-reviews.component';
import { CompanyReviewItemComponent } from '../entity/company/company-profile/company-reviews/company-review-item/company-review-item.component';
import { MainSearchBarComponent } from './main-search-bar/main-search-bar.component';
import { CvSelectModule } from '../theme/select/cv-select-module';
import { NgStringPipesModule } from "angular-pipes";
import { ServicesSelectorComponent } from "./services-selector/services-selector.component";
import { CvCheckboxModule } from "../theme/checkbox/checkbox.module";
import { CvCollapseModule } from "../theme/collapse/cv-collapse.module";
import { FindProfessionalsComponent } from "./find-professionals/find-professionals.component";
import { OrderServiceDirective } from '../directives/order-service.directive';
import { SharedDirectivesModule } from "./shared-directives.module";
import { CvFieldsModule } from "../theme/fields/cv-fields.module";
import { CvInputModule } from "../theme/input/cv-input.module";
import { CvInputFieldModule } from "../theme/input-field/form-field.module";
import { SubscriptionComponent } from './billing-subscription/subscription.component';
import { CvIconModule } from '../theme/icon/cv-icon-module';
import { CvRadioModule } from "../theme/radio/radio.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatGridListModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    FlexLayoutModule,
    PipesModule,
    MessengerModule,
    NgStringPipesModule,
    FileUploadModule,
    CvButtonModule,
    CvSpinnerModule,
    CvSelectModule,
    CvIconModule,
    CvCheckboxModule,
    CvCollapseModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
    CvRadioModule,
    SharedDirectivesModule
  ],
  declarations: [
    AccountNavComponent,
    RatingComponent,
    ResponseMessageComponent,
    PhoneHelpComponent,
    ImagesUploaderComponent,
    CompanyReviewsComponent,
    CompanyReviewItemComponent,
    OrderServiceDirective,
    MainSearchBarComponent,
    ServicesSelectorComponent,
    FindProfessionalsComponent,
    SubscriptionComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CvCheckboxModule,
    RouterModule,
    EqualValidator,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatGridListModule,
    MatTooltipModule,
    MatProgressBarModule,
    FlexLayoutModule,
    AccountNavComponent,
    RatingComponent,
    ResponseMessageComponent,
    PhoneHelpComponent,
    PipesModule,
    MessengerModule,
    NgStringPipesModule,
    ImagesUploaderComponent,
    CompanyReviewsComponent,
    CompanyReviewItemComponent,
    CvButtonModule,
    CvSpinnerModule,
    CvSelectModule,
    CvCheckboxModule,
    CvCollapseModule,
    CvFieldsModule,
    CvInputModule,
    CvInputFieldModule,
    CvRadioModule,
    OrderServiceDirective,
    MainSearchBarComponent,
    ServicesSelectorComponent,
    FindProfessionalsComponent,
    SharedDirectivesModule,
    SubscriptionComponent
  ],
  providers: [
  ]
})

export class SharedModule {
}
