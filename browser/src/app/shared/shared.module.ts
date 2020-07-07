import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImagesUploaderComponent } from './image-uploader/image-uploader.component';
import { RatingComponent } from './rating-component/rating.component';
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
import { NgStringPipesModule, NgTruncatePipeModule } from "angular-pipes";
import { ServicesSelectorComponent } from "./services-selector/services-selector.component";
import { CvCheckboxModule } from "../theme/checkbox/checkbox.module";
import { CvCollapseModule } from "../theme/collapse/cv-collapse.module";
import { FindProfessionalsComponent } from "./find-professionals/find-professionals.component";
import { SharedDirectivesModule } from "./shared-directives.module";
import { CvFieldsModule } from "../theme/fields/cv-fields.module";
import { CvInputModule } from "../theme/input/cv-input.module";
import { CvInputFieldModule } from "../theme/input-field/form-field.module";
import { SubscriptionComponent } from './billing-subscription/subscription.component';
import { CvIconModule } from '../theme/icon/cv-icon-module';
import { CvRadioModule } from "../theme/radio/radio.module";
import { PhoneValidationComponent } from "./phone-validation/phone-validation.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { TestimonialsComponent } from "./testimonials/testimonials.component";
import { SuggestedLocationComponent } from './suggested-location/suggested-location.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { EmailVerificationHintCardComponent } from "./email-verification-hint-card/email-verification-hint-card.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatProgressSpinnerModule,
    FlexLayoutModule,
    PipesModule,
    MessengerModule,
    NgStringPipesModule,
    NgTruncatePipeModule,
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
    SharedDirectivesModule,
    NgTruncatePipeModule
  ],
  declarations: [
    AccountNavComponent,
    RatingComponent,
    ResponseMessageComponent,
    ImagesUploaderComponent,
    CompanyReviewsComponent,
    CompanyReviewItemComponent,
    MainSearchBarComponent,
    ServicesSelectorComponent,
    FindProfessionalsComponent,
    SubscriptionComponent,
    PhoneValidationComponent,
    TestimonialsComponent,
    SuggestedLocationComponent,
    EmailVerificationHintCardComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    PipesModule,
    MessengerModule,
    NgStringPipesModule,
    NgTruncatePipeModule,
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
    MainSearchBarComponent,
    ServicesSelectorComponent,
    FindProfessionalsComponent,
    SharedDirectivesModule,
    SubscriptionComponent,
    PhoneValidationComponent,
    NgTruncatePipeModule,
    TestimonialsComponent,
    SuggestedLocationComponent,
    EmailVerificationHintCardComponent
  ],
  providers: [
  ]
})

export class SharedModule {
}
